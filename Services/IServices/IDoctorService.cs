using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;

namespace MedSync.Services.IServices
{
    public interface IDoctorService
    {
        Task<CountsStatCardsResponseDto> GetDashboardCardStatsAsync(DashboardFilterRequestDto request);
        
    }
}
