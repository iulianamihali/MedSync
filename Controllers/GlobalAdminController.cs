using MedSync.Attributes;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.Enums;
using MedSync.Services;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.GlobalAdmin)]
    public class GlobalAdminController : ControllerBase
    {
        private readonly IGlobalAdminService _globalAdminService;

        public GlobalAdminController(IGlobalAdminService globalAdminService)
        {
            _globalAdminService = globalAdminService;
        }

        [HttpGet("dashboardStatsCards")]
        public async Task<IActionResult> GetDashboardStatsCards(
            [FromQuery] DashboardFilterRequestDto request
        )
        {
            var response = await _globalAdminService.GetDashboardStatsCardsAsync(request);
            return Ok(response);
        }

        [HttpGet("dashboardSupportStatsBarChart")]
        public async Task<IActionResult> GetDashboardSupportStatsBarChart(
            [FromQuery] DashboardFilterRequestDto request
        )
        {
            var response = await _globalAdminService.GetDashboardSupportStatsBarChart(request);
            return Ok(response);
        }

        [HttpGet("dashboardTopInstitutionsPieChart")]
        public async Task<IActionResult> GetDashboardTopInstitutionsPieChart(
            [FromQuery] DashboardFilterRequestDto request
        )
        {
            var response = await _globalAdminService.GetDashboardTopInstitutionsPieChart(request);
            return Ok(response);
        }
    }
}
