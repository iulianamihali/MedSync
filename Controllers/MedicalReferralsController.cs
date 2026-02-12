using MedSync.Attributes;
using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.Enums;
using MedSync.Services;
using MedSync.Services.IServices;
using MedSync.Services.pdf;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.Doctor)]

    public class MedicalReferralsController : ControllerBase
    {
        private readonly IMedicalReferralService _medicalReferralService;
        private readonly PdfService _pdfService;

        public MedicalReferralsController(IMedicalReferralService medicalReferralService, PdfService pdfService)
        {
            _medicalReferralService = medicalReferralService;
            _pdfService = pdfService;
        }

        [HttpPost("createMedicalReferral")]
        public async Task<IActionResult> CreateMedicalReferralAsync([FromBody] CreateMedicalReferralRequestDto request)
        {
            var referralId = await _medicalReferralService.CreateMedicalReferralAsync(request);
            var obj = await _medicalReferralService.GetMedicalReferralPdfDataAsync(referralId);

            var pdfBytes =  _pdfService.GenerateMedicalReferral(obj);

            return File(pdfBytes, "application/pdf", "MedicalReferral.pdf");
        }
    }
}
