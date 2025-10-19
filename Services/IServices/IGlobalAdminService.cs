using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;

namespace MedSync.Services.IServices
{
    public interface IGlobalAdminService
    {
        Task<StatCardsResponseDto> GetDashboardStatsCardsAsync(DashboardFilterRequestDto requestDto);
        Task<List<SupportBarchartPointsDto>> GetDashboardSupportStatsBarChart(DashboardFilterRequestDto requestDto);
        Task<List<PieChartTopInstDto>> GetDashboardTopInstitutionsPieChart(DashboardFilterRequestDto requestDto);
    }
}
