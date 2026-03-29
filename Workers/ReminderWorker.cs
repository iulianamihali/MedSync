using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace MedSync.Workers
{
    public class ReminderWorker : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<ReminderWorker> _logger;
        public ReminderWorker(IServiceProvider services, ILogger<ReminderWorker> logger)
        {
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while(!stoppingToken.IsCancellationRequested)
            {
                using var scope = _services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<MedSyncContext>();
                var emailService = scope.ServiceProvider.GetRequiredService<MailerSendService>();
                var now = DateTime.UtcNow;
                var maxTime = now.AddHours(24);
              

                var appointments = await db.Appointments
                       .Where(a => a.StartDateTime <= maxTime
                             && !a.ReminderSent
                             && a.Status != AppointmentStatusEnumType.Canceled)
                    .Select(a => new
                    {
                        Id = a.Id,
                        StartDateTime = a.StartDateTime,
                        Email = a.Patient != null ? a.Patient.User.Email : a.UnregisteredPatient.Email,
                        PatientName = a.Patient != null ? $"{a.Patient.User.FirstName} {a.Patient.User.LastName}"  : $"{a.UnregisteredPatient.FirstName} {a.UnregisteredPatient.LastName}",
                        DoctorName = $"{a.Doctor.User.FirstName} {a.Doctor.User.LastName}",
                        InstitutionName = a.Institution.Name, 
                        InstitutionAddress = a.Institution.Address != null ? $"{a.Institution.Address.City}, {a.Institution.Address.Street}, {a.Institution.Address.Number}, {a.Institution.Address.Country}" : string.Empty,

                    })
                    .ToListAsync(stoppingToken);

                var json = File.ReadAllText("EmailTemplates.json");
                using var doc = JsonDocument.Parse(json);

                foreach (var apt in appointments)
                {
                    if (apt.StartDateTime.Date == now.Date)
                        continue;
                
                    var template = doc.RootElement.GetProperty("AppointmentReminder");
                    var subject = template.GetProperty("subject").GetString()
                                          .Replace("{{AppointmentTime}}", apt.StartDateTime.ToString("hh:mm tt"));
;
                    var html = template.GetProperty("html").GetString()
                                 .Replace("{{PatientName}}", apt.PatientName)
                                 .Replace("{{AppointmentDate}}", apt.StartDateTime.ToString("MMMM dd, yyyy"))
                                 .Replace("{{AppointmentTime}}", apt.StartDateTime.ToString("hh:mm tt"))
                                 .Replace("{{DoctorName}}", apt.DoctorName)
                                 .Replace("{{InstitutionName}}", apt.InstitutionName)
                                 .Replace("{{InstitutionAddress}}", apt.InstitutionAddress);
                    await emailService.SendEmailAsync(apt.Email, subject!, html!);
                   
                }
                List<Guid> appointmentIds = appointments.Select(a => a.Id).ToList();
                await db.Appointments
                       .Where(a => appointmentIds.Contains(a.Id))
                       .ExecuteUpdateAsync(s => s.SetProperty(a => a.ReminderSent, true));

                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);

            }
        }
    }
}
