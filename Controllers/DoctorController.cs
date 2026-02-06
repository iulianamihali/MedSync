using MedSync.Attributes;
using Microsoft.AspNetCore.Mvc;
using MedSync.DataLayer.Enums;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.Services.IServices;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.Doctor)]

    public class DoctorController : ControllerBase
    {
        private readonly IDoctorService _doctorService;
        public DoctorController(IDoctorService doctorService) {
            _doctorService = doctorService;
        }

        [HttpGet("dashboardStatsCards")]
        public async Task<IActionResult> GetDashboardCardStatsAsync([FromQuery] DashboardFilterRequestDto request)
        {
            var response = await _doctorService.GetDashboardCardStatsAsync(request);
            return Ok(response);
        }
        [HttpGet("getDataTableMyPatients/{page}/{institutionId}/{doctorId}")]
        public async Task<IActionResult> GetDataTableMyPatientsAsync(int page, Guid institutionId, Guid doctorId)
        {
            var response = await _doctorService.GetDataTableMyPatientsAsync(page, institutionId, doctorId);
            return Ok(response);
        }
    }
}
