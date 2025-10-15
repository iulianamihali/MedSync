using Microsoft.AspNetCore.Mvc;
using MedSync.Services;
using MedSync.Services.IServices;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GlobalAdminController : ControllerBase
    {
        private readonly IGlobalAdminService _globalAdminService;
        public GlobalAdminController(IGlobalAdminService globalAdminService)
        {
            _globalAdminService = globalAdminService;
        }

        [HttpGet("dashboardStatsCards")]
        public async Task<IActionResult> GetDashboardStatsCards([FromQuery] StatCardsRequestDto request)
        {
            var response = await _globalAdminService.GetDashboardStatsCardsAsync(request);
            return Ok(response);
        }


    }
}
