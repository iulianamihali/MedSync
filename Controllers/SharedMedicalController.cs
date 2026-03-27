using MedSync.Services;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class SharedMedicalController : ControllerBase
    {
        private readonly IPatientService _patientService;
        private readonly SharedMedicalService _sharedMedicalService;
        public SharedMedicalController(IPatientService patientService, SharedMedicalService sharedMedicalService)
        {
            _patientService = patientService;
            _sharedMedicalService = sharedMedicalService;
        }

        [HttpGet("getSharedMedicalHistory/{token}")]
        public async Task<IActionResult> GetSharedMedicalHistoryAsync(string token)
        {
            var history = await _sharedMedicalService.GetSharedMedicalHistoryAsync(token);
            if (history == null)
                return NotFound("Invalid or expired token.");
            return Ok(history);

        }

        [HttpGet("getAppointmentDetails/{token}/{appointmentId}")]
        public async Task<IActionResult> GetSharedAppointmentDetails(string token, Guid appointmentId)
        {
            var result = await _sharedMedicalService.GetSharedAppointmentDetailsAsync(token, appointmentId);
            if (result == null)
                return NotFound("Invalid or expired token.");
            return Ok(result);
        }
    }
}
