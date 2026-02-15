using MedSync.Attributes;
using MedSync.DataLayer.DTOs.MedicalPrescriptions;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using MedSync.Services.pdf;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.Doctor)]
    public class MedicalPrescriptionController : ControllerBase
    {
        private readonly IMedicalPrescriptionService _medicalPrescriptionService;
        private readonly PdfService _pdfService;

        public MedicalPrescriptionController(IMedicalPrescriptionService medicalPrescriptionService, PdfService service)
        {
            _medicalPrescriptionService = medicalPrescriptionService;
            _pdfService = service;
        }

        [HttpPost("addPrescription")]
        public async Task<IActionResult> AddMedicalPrescriptionAsync(AddMedicalPrescriptionRequestDto request)
        {
            var response = await _medicalPrescriptionService.AddMedicalPrescriptionAsync(request);
            return Ok(response);
        }

        [HttpGet("getMedicalPrescriptionPdf/{prescriptionId}")]
        public async Task<IActionResult> GetMedicalPrescriptionPdfAsync(Guid prescriptionId)
        {
            var obj = await _medicalPrescriptionService.GetMedicalPrescriptionPdfDataAsync(prescriptionId);
            var pdfBytes =  _pdfService.GenerateMedicalPrescription(obj);
            return File(pdfBytes, "application/pdf", "MedicalPrescription.pdf");
        }
    } 
}
