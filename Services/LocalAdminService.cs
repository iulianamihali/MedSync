using Azure.Core;
using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.DataLayer.DTOs.LocalAdmin.Dashboard;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace MedSync.Services
{
    public class LocalAdminService : ILocalAdminService
    {
        private readonly MedSyncContext _context;
        private readonly MailerSendService _mailerSendService;
        public LocalAdminService(MedSyncContext context, MailerSendService mailerSendService)
        {
            _context = context;
            _mailerSendService = mailerSendService;
        }
        public async Task<CountsStatCardsResponseDto> GetDashboardStatCardsAsync(DashboardFilterRequestDto request)
        {
            var appointmentsCount = await _context.Appointments
                .Where(a => a.InstitutionId == request.InstitutionId &&
                (a.StartDateTime >= request.From.Date && a.StartDateTime < request.To.Date.AddDays(1)))
                .CountAsync();
            var totalDoctors = await _context.InstitutionUsers
                .Include(u => u.User)
                .Where(u =>
                    u.InstitutionId == request.InstitutionId &&
                    u.User.Role == UserType.Doctor &&
                    u.User.IsActive
                )
                .CountAsync();
            var canceledAppointments = await _context.Appointments
                .Where(a => a.InstitutionId == request.InstitutionId &&
                (a.StartDateTime >= request.From.Date &&
                a.StartDateTime < request.To.Date.AddDays(1)) &&
                a.Status == AppointmentStatusEnumType.Canceled)
                .CountAsync();
            var appointmentsWithReferral = await _context.Appointments
                .Where(a => a.InstitutionId == request.InstitutionId &&
                (a.StartDateTime >= request.From.Date && a.StartDateTime < request.To.Date.AddDays(1)) &&
                a.ReferralCode != null)
                .CountAsync();
            var response = new CountsStatCardsResponseDto
            {
                AppointmentsCount = appointmentsCount,
                DoctorsCount = totalDoctors,
                CanceledAppointmentsCount = canceledAppointments,
                AppointmentsWithReferralCount = appointmentsWithReferral,
            };
            return response;

        }

        public async Task<List<RecentAppointmentsDto>> GetDetailsRecentAppointmentsAsync(Guid institutionId)
        {
            var response = await _context.Appointments
                .Include(u => u.Patient)
                    .ThenInclude(u => u.User)
                .Include(u => u.UnregisteredPatient)
                .Include(u => u.Doctor)
                    .ThenInclude(u => u.User)
                .Include(u => u.InstitutionService)
                    .ThenInclude(u => u.Specialty)
                .Include(u => u.InstitutionService)
                    .ThenInclude(u => u.Service)
                      
                .Where(u => u.InstitutionService.InstitutionId == institutionId
                && (u.StartDateTime.Date >= DateTime.UtcNow.Date && u.StartDateTime.Date <= DateTime.UtcNow)
                && (u.Status == AppointmentStatusEnumType.Confirmed || u.Status == AppointmentStatusEnumType.InProgress || u.Status == AppointmentStatusEnumType.Rescheduled)
                )
                .Select(
                    u => new RecentAppointmentsDto
                    {
                        AppointmentId = u.Id,
                        PatientId = u.PatientId ?? u.UnregisteredPatientId,
                        DoctorId = u.DoctorId,
                        PatientName = u.Patient != null 
                        ? $"{u.Patient.User.FirstName} {u.Patient.User.LastName}"
                        : $"{u.UnregisteredPatient.FirstName} {u.UnregisteredPatient.LastName}",
                        DoctorName = $"Dr. {u.Doctor.User.FirstName} {u.Doctor.User.LastName}",
                        DateTimeUtc = u.StartDateTime,
                        Price = u.InstitutionService.Price,
                        Specialty = u.InstitutionService.Specialty.Name,
                        Type = u.InstitutionService.Service.Name,
                        Duration = u.InstitutionService.Duration,
                        Status = u.Status
                    }
                ).OrderByDescending(u => u.DateTimeUtc)
                .ToListAsync();
            return response;
        }

        public async Task<bool> EditStatusAppointmentAsync(EditStatusAppointmentRequestDto request)
        {
            var response = await _context.Appointments
                .Where(a => a.Id == request.AppointmentId)
                .FirstOrDefaultAsync();
            if (response == null)
                return false;
            response.Status = request.Status;
            _context.Appointments.Update(response);
            return (await _context.SaveChangesAsync()) > 0;
        }

        public async Task<List<DoctorReqPopUpResponseDto>> GetDoctorRequestDetailsAsync(Guid institutionId)
        {
            var result = await _context.DoctorRequests
                .AsNoTracking()
                .Include(i => i.Institution)
                .Include(i => i.User)
                    .ThenInclude(i => i.Doctor)
                        .ThenInclude(i => i.DoctorSpecialties)
                            .ThenInclude(i => i.Specialty)
                .Where(i => i.InstitutionId == institutionId &&
                i.Status == DoctorRequestsStatusEnumType.Pending
                )
                .Select(i => new DoctorReqPopUpResponseDto
                {
                    Id = i.Id,
                    Name = $"{i.User.FirstName} {i.User.LastName}",
                    Email = i.User.Email,
                    DateOfBirth = i.User.DateOfBirth.ToString(),
                    PhoneNumber = i.User.PhoneNumber,
                    UniversityName = i.User.Doctor.UniversityName,
                    Specialization = string.Join(", ", i.User.Doctor.DoctorSpecialties.Select(x => x.Specialty.Name).ToList()),
                    MedicalLicenseNumber = i.User.Doctor.MedicalLicenseNumber,
                    YearsOfExperience = i.User.Doctor.YearsOfExperience.ToString(),
                    CreatedAt = i.CreatedAt

                })
                .OrderBy(i => i.CreatedAt)
                .ToListAsync();
            return result;
        }

        public async Task<bool> UpdateStatusDoctorRequestAsync(UpdateDoctorRequestDto request)
        {
            var result = await _context.DoctorRequests
                  .Include(u => u.User)
                  .Where(u => u.Id == request.Id)
                  .FirstOrDefaultAsync();
            if (result != null)
            {
                if (request.Value)
                {
                    result.Status = DoctorRequestsStatusEnumType.Approved;
                    result.UpdatedAt = DateTime.UtcNow;
                    _context.DoctorRequests.Update(result);
                    var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == result.UserId);
                    if (user != null)
                    {
                        user.IsActive = true;
                        _context.Users.Update(user);
                    }
                }
                else
                {
                    result.Status = DoctorRequestsStatusEnumType.Rejected;
                    result.UpdatedAt = DateTime.UtcNow;
                    _context.DoctorRequests.Update(result);
                }

                var success = (await _context.SaveChangesAsync()) > 0;
               
                if (success)
                {
                    var json = File.ReadAllText("EmailTemplates.json");
                    using var doc = JsonDocument.Parse(json);
                    if (request.Value)
                    {
                        var template = doc.RootElement.GetProperty("DoctorApproved");
                        var subject = template.GetProperty("subject").GetString();
                        var html = template.GetProperty("html").GetString()
                            .Replace("{{DoctorName}}", result.User.FirstName + "" + result.User.LastName);
                        await _mailerSendService.SendEmailAsync(
                            toEmail: "miuliana959@gmail.com",
                            subject: subject,
                            message: html
                            );

                    }
                    else
                    {
                        var template = doc.RootElement.GetProperty("DoctorRejected");
                        var subject = template.GetProperty("subject").GetString();
                        var html = template.GetProperty("html").GetString()
                            .Replace("{{DoctorName}}", result.User.FirstName + "" + result.User.LastName);
                        await _mailerSendService.SendEmailAsync(
                           toEmail: "miuliana959@gmail.com",
                           subject: template.GetProperty("subject").GetString(),
                           message: html
                           );
                    }
                    return success;
                }

            }
            return false;

        }
           
    }
}
