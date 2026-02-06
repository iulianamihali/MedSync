using Microsoft.AspNetCore.Mvc;
using MedSync.Services.IServices;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
       private readonly IPatientService _patientService;
       public PatientController(IPatientService patientService) {
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
    }
}
