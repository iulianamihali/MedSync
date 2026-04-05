using MedSync.Attributes;
using MedSync.DataLayer.DTOs.MedicalRecords;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using MedSync.Services.pdf;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.Doctor, UserType.Patient)]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly IMedicalRecordsService _medicalRecordsService;
        private readonly PdfService _pdfService;

        public MedicalRecordsController(
            IMedicalRecordsService medicalRecordsService,
            PdfService pdfService
        )
        {
            _medicalRecordsService = medicalRecordsService;
            _pdfService = pdfService;
        }

        [HttpGet("getMedicalRecordByAppointment/{appointmentId}")]
        public async Task<IActionResult> GetMedicalRecordByAppointmentAsync(Guid appointmentId)
        {
            var result = await _medicalRecordsService.GetMedicalRecordByAppointmentAsync(
                appointmentId
            );
            return Ok(result);
        }

        [HttpPost("editMedicalRecord")]
        public async Task<IActionResult> EditMedicalRecordAsync(
            [FromBody] EditMedicalRecordRequestDto request
        )
        {
            var result = await _medicalRecordsService.EditMedicalRecordAsync(request);
            return Ok(result);
        }

        [HttpGet("getMedicalReportPdfData/{medicalRecordId}")]
        public async Task<IActionResult> ExportMedicalReportPdf(Guid medicalRecordId)
        {
            var dto = await _medicalRecordsService.GetMedicalReportPdfDataAsync(medicalRecordId);

            if (dto == null)
                return NotFound();

            var pdfBytes = _pdfService.GenerateMedicalReport(dto);

            return File(pdfBytes, "application/pdf", "MedicalReport.pdf");
        }
    }
}
