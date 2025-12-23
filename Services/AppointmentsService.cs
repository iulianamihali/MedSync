using MedSync.DataLayer.DTOs.Appointments;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

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
                     PatientName = $"{x.Patient.User.FirstName} {x.Patient.User.LastName}",
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

    }
}
