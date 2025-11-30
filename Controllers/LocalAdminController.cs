using MedSync.Attributes;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.DTOs.LocalAdmin;
using MedSync.DataLayer.DTOs.LocalAdmin.Dashboard;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.LocalAdmin)]
    public class LocalAdminController : ControllerBase
    {
        private readonly ILocalAdminService _localAdminService;
        public LocalAdminController(ILocalAdminService localAdminService)
        {
            _localAdminService = localAdminService;
        }
        [HttpGet("dashboardStatsCards")]
        public async Task<IActionResult> GetDashboardStatCards([FromQuery] DashboardFilterRequestDto request)
        {
            var response = await _localAdminService.GetDashboardStatCardsAsync(request);
            return Ok(response);
        }
        [HttpGet("detailsRecentAppointments/{institutionId}")]
        public async Task<IActionResult> GetDetailsRecentAppointments(Guid institutionId)
        {
            var response = await _localAdminService.GetDetailsRecentAppointmentsAsync(institutionId);
            return Ok(response);
        }
        [HttpPut("updateStatusAppointment")]
        public async Task<IActionResult> EditStatusAppointment([FromBody] EditStatusAppointmentRequestDto request)
        {
            var result = await _localAdminService.EditStatusAppointmentAsync(request);
            return Ok(result);
        }
    }
}
