using Azure.Core;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
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
        public async Task<StatCardsResponseDto> GetDashboardStatsCarsAsync(DashboardFilterRequestDto request)
        {
            var currentAppointmentsCount = await _context.Appointments
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
                a.Status == AppointmentStatusEnumType.Canceled
                )
                .CountAsync();
                
        }

    }
}
