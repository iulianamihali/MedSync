using MedSync.Attributes;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.Patient)]

    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;
        public PatientController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        [HttpGet("getPatientDetails/{patientId}")]
        public async Task<IActionResult> GetPatientDetailsAsync(Guid patientId)
        {
            var response = await _patientService.GetPatientDetailsAsync(patientId);
            return Ok(response);
        }
        [HttpGet("getPatientAppointmentsSummary/{institutionId}/{doctorId}/{patientId}")]
        public async Task<IActionResult> GetPatientAppointmentsSummariesAsync(Guid institutionId, Guid doctorId, Guid patientId)
        {
            var response = await _patientService.GetPatientAppointmentsSummariesAsync(institutionId, doctorId, patientId);
            return Ok(response);
        }

        [HttpGet("getFutureAppointments/{patientId}")]
        public async Task<IActionResult> GetFutureAppointmentsAsync(Guid patientId)
        {
            var response = await _patientService.GetFutureAppointmentsAsync(patientId);
            return Ok(response);
        }

        [HttpGet("getActiveMedications/{patientId}")]
        public async Task<IActionResult> GetActiveMedicationsAsync(Guid patientId)
        {
            var response = await _patientService.GetActiveMedicationsAsync(patientId);
            return Ok(response);
        }

        [HttpGet("getAppointmentHistory/{patientId}")]
        public async Task<IActionResult> GetAppointmentHistoryAsync(Guid patientId)
        {
            var response = await _patientService.GetAppointmentHistoryAsync(patientId);
            return Ok(response);
        }
        [HttpGet("getAppointmentHistoryDetails/{appointmentId}")]
        public async Task<IActionResult> GetAppointmentHistoryDetailsResponseAsync(Guid appointmentId)
        {
            var response = await _patientService.GetAppointmentHistoryDetailsResponseAsync(appointmentId);
            return Ok(response);
        }

        [HttpPost("generateLink")]
        public async Task<IActionResult> GenerateSharedLink([FromBody] Guid patientId)
        {
            var token = await _patientService.GenerateSharedLinkAsync(patientId);
            return Ok(token);
        }
        [HttpGet("getActiveLinkStatus/{patientId}")]
        public async Task<IActionResult> GetLinkStatusAsync(Guid patientId)
        {
            var response = await _patientService.GetLinkStatusAsync(patientId);
            return Ok(response);
        }
        [HttpPost("revokeSharedLink")]
        public async Task<IActionResult> RevokeSharedLinkAsync([FromBody] Guid patientId)
        {
            var result = await _patientService.RevokeSharedLinkAsync(patientId);
            return Ok(result);
        }
        //[HttpGet("getPatientBasicInfo/{patientId}")]
        //public async Task<IActionResult> GetPatientBasicInfoAsync(Guid patientId)
        //{
        //    var response = await _patientService.GetPatientBasicInfoAsync(patientId);
        //    return Ok(response);
        //}
    }
}
