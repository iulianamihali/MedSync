using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace MedSync.Services
{
    public class AppointmentsService : IAppointmentsService
    {
        private readonly MedSyncContext _context;
        public AppointmentsService(MedSyncContext context)
        {
            _context = context;
        }
        public async Task<List<CalendarAppointmentsDto>> GetCalendarAppointmentsAsync(CalendarAppointmentsRequestDto request)
        {
            var appointments = await _context.Appointments
                .Include(x => x.Patient)
                    .ThenInclude(x => x.User)
                .Include(x => x.UnregisteredPatient)
                .Include(x => x.Doctor)
                    .ThenInclude(x => x.User)
                .Include(x => x.InstitutionService)
                    .ThenInclude(x => x.Specialty)
                 .Include(x => x.InstitutionService)
                    .ThenInclude(x => x.Service)
                 .Where(x => x.StartDateTime.Date >= request.From.Date && x.StartDateTime.Date <= request.To.Date)
                 .Select(x => new CalendarAppointmentsDto {
                     Id = x.Id,
                     Status = x.Status,
                     Specialty = x.InstitutionService.Specialty.Name,
                     Service = x.InstitutionService.Service.Name,
                     DoctorName = $"{x.Doctor.User.FirstName} {x.Doctor.User.LastName}",
                     PatientName = x.Patient != null 
                        ? $"{x.Patient.User.FirstName} {x.Patient.User.LastName}" 
                        : $"{x.UnregisteredPatient.FirstName} {x.UnregisteredPatient.LastName}",
                     StartDateTimeUtc = x.StartDateTime,
                     EndDateTimeUtc = x.EndDateTime,
                     StandardPrice = x.InstitutionService.Price,
                     TotalPrice = x.TotalPrice,
                     Duration = x.InstitutionService.Duration,
                 })
                 .ToListAsync();
            return appointments;

        }

        public async Task<bool> EditInfoAppointment(EditInfoAppointmentRequest request)
        {
            var result = await _context.Appointments
                .Where(i => i.Id == request.Id)
                .FirstOrDefaultAsync();
            if(result != null)
            {
                result.TotalPrice = request.TotalPrice;
                result.Status = request.Status;
                _context.Appointments.Update(result);
            }
            return (await _context.SaveChangesAsync()) > 0;
        }

        public async Task<bool> AddAppointment(AddAppointmentRequestDto request)
        {
            var institutionService = await _context.InstitutionServices
                    .Where(i => i.SpecialtyId == request.SpecialtyId)
                    .FirstOrDefaultAsync();
            if (institutionService == null)
                return false;
            
            if (request.PatientId != null)
            {
                var newApp = new Appointment
                {
                    Id = Guid.NewGuid(),
                    InstitutionServiceId = institutionService.Id,
                    PatientUserId = request.PatientId,
                    DoctorUserId = request.DoctorId,
                    InstitutionId = request.InstitutionId,
                    StartDateTime = request.startTime,
                    EndDateTime = request.startTime.AddMinutes(institutionService.Duration),
                    TotalPrice = institutionService.Price,
                    Status = AppointmentStatusEnumType.Confirmed,
                    ReferralCode = request.ReferralCode,
                };
                _context.Appointments.Add(newApp);
                return (await _context.SaveChangesAsync()) > 0;
            }
            else if (request.UnregisteredPatientId != null)
            {
                var newApp = new Appointment
                {
                    Id = Guid.NewGuid(),
                    InstitutionServiceId = institutionService.Id,
                    UnregisteredPatientId = request.UnregisteredPatientId,
                    DoctorUserId = request.DoctorId,
                    InstitutionId = request.InstitutionId,
                    StartDateTime = request.startTime,
                    EndDateTime = request.startTime.AddMinutes(institutionService.Duration),
                    TotalPrice = institutionService.Price,
                    Status = AppointmentStatusEnumType.Confirmed,
                    ReferralCode = request.ReferralCode,
                };
                _context.Appointments.Add(newApp);
                return (await _context.SaveChangesAsync()) > 0;
            }
            else
            {
                var newUnregPatient = new UnregisteredPatient
                {
                    Id = Guid.NewGuid(),
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Cnp = request.Cnp,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    CreatedAt = DateTime.UtcNow,
                };
                _context.UnregisteredPatients.Add(newUnregPatient);
                var newApp = new Appointment
                {
                    Id = Guid.NewGuid(),
                    InstitutionServiceId = institutionService.Id,
                    UnregisteredPatientId = newUnregPatient.Id,
                    DoctorUserId = request.DoctorId,
                    InstitutionId = request.InstitutionId,
                    StartDateTime = request.startTime,
                    EndDateTime = request.startTime.AddMinutes(institutionService.Duration),
                    TotalPrice = institutionService.Price,
                    Status = AppointmentStatusEnumType.Confirmed,
                    ReferralCode = request.ReferralCode,
                };
                _context.Appointments.Add(newApp);
                return (await _context.SaveChangesAsync()) > 0;
            }
        }

        public async Task<List<UpcomingAppointmentsResponseDto>> GetUpcomingAppointmentsForDoctorAsync(Guid institutionId, Guid doctorId)
        {
            var result = await _context.Appointments
                .Where(i => i.InstitutionId == institutionId &&
                i.DoctorUserId == doctorId &&
                i.StartDateTime.Date >= DateTime.UtcNow.Date && i.StartDateTime.Date <= DateTime.UtcNow)
                .Select(x => new UpcomingAppointmentsResponseDto
                {
                    AppointmentId = x.Id,
                    PatientId = x.PatientUserId ?? x.UnregisteredPatientId,
                    PatientName = x.Patient != null
                        ? $"{x.Patient.User.FirstName} {x.Patient.User.LastName}"
                        : $"{x.UnregisteredPatient.FirstName} {x.UnregisteredPatient.LastName}",
                    DateTimeUtc = x.StartDateTime,
                    Type = x.InstitutionService.Service.Name,
                    Status = x.Status,
                })
                .OrderBy(x => x.DateTimeUtc)
                .ToListAsync();
            return result;

        }

        public async Task<List<CalendarAppointmentsByDoctorResponseDto>> GetCalendarAppointmentsByDoctorAsync(CalendarAppointmentsRequestDto request)
        {
            var appointments = await _context.Appointments
                .Where(a => a.InstitutionId == request.InstitutionId &&
                            a.DoctorUserId == request.DoctorId &&
                            a.StartDateTime.Date >= request.From.Date &&
                            a.StartDateTime.Date <= request.To.Date)
                .Select(x => new CalendarAppointmentsByDoctorResponseDto
                {
                    Id = x.Id,
                    Status = x.Status, 
                    Service = x.InstitutionService.Service.Name,
                    PatientName = x.Patient != null
                        ? $"{x.Patient.User.FirstName} {x.Patient.User.LastName}"
                        : $"{x.UnregisteredPatient.FirstName} {x.UnregisteredPatient.LastName}",
                    StartDateTimeUtc = x.StartDateTime,
                    EndDateTimeUtc = x.EndDateTime,
                    Duration = x.InstitutionService.Duration,
                })
                .ToListAsync();
            return appointments;
        }


    }
}
