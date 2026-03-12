using MedSync.Attributes;
using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.LocalAdmin, UserType.Doctor, UserType.Patient)]
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
        [HttpGet("getUpcomingAppointmentsForDoctor/{institutionId}/{doctorId}")]
        public async Task<IActionResult> GetUpcomingAppointmentsForDoctorAsync(Guid institutionId, Guid doctorId)
        {
            var result = await _appointmentsService.GetUpcomingAppointmentsForDoctorAsync(institutionId, doctorId);
            return Ok(result);
        }
        [HttpPost("getCalendarAppointmentsByDoctor")]
        public async Task<IActionResult> GetCalendarAppointmentsByDoctorAsync([FromBody] CalendarAppointmentsRequestDto request)
        {
            var result = await _appointmentsService.GetCalendarAppointmentsByDoctorAsync(request);
            return Ok(result);
        }
        [HttpGet("getPatientBasicInfo/{appointmentId}")]
        public async Task<IActionResult> GetPatientBasicInfoAsync(Guid appointmentId)
        {
            var result = await _appointmentsService.GetPatientBasicInfoAsync(appointmentId);
            return Ok(result);
        }
    }
}
