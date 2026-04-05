using MedSync.Attributes;
using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.DataLayer.DTOs.LocalAdmin;
using MedSync.DataLayer.DTOs.LocalAdmin.Dashboard;
using MedSync.DataLayer.Enums;
using MedSync.Services;
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
        private readonly IAppointmentsService _appointmentsService;

        public LocalAdminController(
            ILocalAdminService localAdminService,
            IAppointmentsService appointmentsService
        )
        {
            _localAdminService = localAdminService;
            _appointmentsService = appointmentsService;
        }

        [HttpGet("dashboardStatsCards")]
        public async Task<IActionResult> GetDashboardStatCards(
            [FromQuery] DashboardFilterRequestDto request
        )
        {
            var response = await _localAdminService.GetDashboardStatCardsAsync(request);
            return Ok(response);
        }

        [HttpGet("detailsRecentAppointments/{institutionId}")]
        public async Task<IActionResult> GetDetailsRecentAppointments(Guid institutionId)
        {
            var response = await _localAdminService.GetDetailsRecentAppointmentsAsync(
                institutionId
            );
            return Ok(response);
        }

        [HttpPut("updateStatusAppointment")]
        public async Task<IActionResult> EditStatusAppointment(
            [FromBody] EditStatusAppointmentRequestDto request
        )
        {
            var result = await _localAdminService.EditStatusAppointmentAsync(request);
            return Ok(result);
        }

        [HttpGet("getDoctorRequestDetails")]
        public async Task<IActionResult> GetDoctorRequestDetails(Guid institutionId)
        {
            var result = await _localAdminService.GetDoctorRequestDetailsAsync(institutionId);
            return Ok(result);
        }

        [HttpPut("updateDoctorRequest")]
        public async Task<IActionResult> UpdateDoctorRequest(
            [FromBody] UpdateDoctorRequestDto request
        )
        {
            var response = await _localAdminService.UpdateStatusDoctorRequestAsync(request);
            return Ok(response);
        }

        [HttpPost("getCalendarAppointments")]
        public async Task<IActionResult> GetCalendarAppointments(
            [FromBody] CalendarAppointmentsRequestDto request
        )
        {
            var result = await _appointmentsService.GetCalendarAppointmentsAsync(request);
            return Ok(result);
        }

        [HttpPost("editInfoAppointment")]
        public async Task<IActionResult> EditInfoAppointment(
            [FromBody] EditInfoAppointmentRequest request
        )
        {
            var result = await _appointmentsService.EditInfoAppointment(request);
            return Ok(result);
        }
    }
}
