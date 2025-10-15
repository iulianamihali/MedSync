using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;

namespace MedSync.Services.IServices
{
    public interface IGlobalAdminService
    {
        Task<StatCardsResponseDto> GetDashboardStatsCardsAsync(StatCardsRequestDto requestDto);
    }
}
