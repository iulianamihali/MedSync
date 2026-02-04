using MedSync.Attributes;
using MedSync.DataLayer.DTOs.MedicalRecords;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.Doctor)]

    public class MedicalRecordsController : ControllerBase
    {
        private readonly IMedicalRecordsService _medicalRecordsService;
        public MedicalRecordsController(IMedicalRecordsService medicalRecordsService)
        {
            _medicalRecordsService = medicalRecordsService;
        }

        [HttpGet("getMedicalRecordByAppointment/{appointmentId}")]
        public async Task<IActionResult> GetMedicalRecordByAppointmentAsync(Guid appointmentId)
        {
            var result = await _medicalRecordsService.GetMedicalRecordByAppointmentAsync(appointmentId);
            return Ok(result);
        }
        [HttpPost("editMedicalRecord")]
        public async Task<IActionResult> EditMedicalRecordAsync([FromBody] EditMedicalRecordRequestDto request)
        {
            var result = await _medicalRecordsService.EditMedicalRecordAsync(request);
            return Ok(result);
        }


    }
}
