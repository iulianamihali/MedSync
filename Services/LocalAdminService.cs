using Azure.Core;
using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.DTOs.LocalAdmin.Dashboard;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class LocalAdminService : ILocalAdminService
    {
        private readonly MedSyncContext _context;
        public LocalAdminService(MedSyncContext context)
        {
            _context = context;
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

        public async Task<List<AppointmentDto>> GetDetailsRecentAppointmentsAsync(Guid institutionId)
        {
            var response = await _context.Appointments
                .Include(u => u.Patient)
                    .ThenInclude(u => u.User)
                .Include(u => u.Doctor)
                    .ThenInclude(u => u.User)
                .Where(u => u.InstitutionId == institutionId 
                //&& (u.StartDateTime.Date >= DateTime.UtcNow.Date && u.StartDateTime.Date <= DateTime.UtcNow)
                && (u.Status == AppointmentStatusEnumType.Confirmed || u.Status == AppointmentStatusEnumType.InProgress || u.Status == AppointmentStatusEnumType.Rescheduled)
                )
                .Select(
                    u => new AppointmentDto
                    {
                        AppointmentId = u.Id,
                        PatientId = u.PatientId,
                        DoctorId = u.DoctorId,
                        PatientName = $"{u.Patient.User.FirstName} {u.Patient.User.LastName}",
                        DoctorName = $"Dr. {u.Doctor.User.FirstName} {u.Doctor.User.LastName}",
                        DateTimeUtc = u.StartDateTime,
                        Price = u.Price,
                        Type = "Consult",
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

    }
}
