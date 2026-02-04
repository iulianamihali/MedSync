using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly MedSyncContext _context;
        public DoctorService(MedSyncContext context) {
            _context = context;
        }
        public async Task<CountsStatCardsResponseDto> GetDashboardCardStatsAsync(DashboardFilterRequestDto request)
        {
            var fromLocal = request.From.ToLocalTime().Date;
            var toLocal = request.To.ToLocalTime().Date;

            var totalPatientsWithAppointments = await _context.Appointments
                .Where(a => a.InstitutionId == request.InstitutionId &&
                a.DoctorUserId == request.DoctorId)
                .Select(a => a.PatientUserId ?? a.UnregisteredPatientId)
                .Distinct()
                .CountAsync();

            var totalAppointmentsByPeriod = await _context.Appointments
                .Where(a => a.InstitutionId == request.InstitutionId &&
                a.DoctorUserId == request.DoctorId && 
                a.StartDateTime >= fromLocal && a.StartDateTime < toLocal.AddDays(1)
                )
                .CountAsync();

            var response = new CountsStatCardsResponseDto
            {
                TotalPatientsWithAppointments = totalPatientsWithAppointments,
                TotalAppointmentsByPeriod = totalAppointmentsByPeriod,
            };
            return response;
                
        }

    }
}
