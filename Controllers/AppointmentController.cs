using MedSync.Attributes;
using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.LocalAdmin)]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentsService _appointmentsService;
        public AppointmentController(IAppointmentsService appointmentsService)
        {
            _appointmentsService = appointmentsService;
        }
        [HttpPost("addAppointment")]
        public async Task<IActionResult> AddAppointment(AddAppointmentRequestDto request)
        {
            var response = await _appointmentsService.AddAppointment(request);
            return Ok(response);
        }
    }
}
