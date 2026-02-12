using MedSync.Attributes;
using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.Enums;
using MedSync.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.Doctor)]

    public class MedicalReferralsController : ControllerBase
    {
        private readonly MedicalReferralService _medicalReferralService;
        public MedicalReferralsController(MedicalReferralService medicalReferralService)
        {
            _medicalReferralService = medicalReferralService;
        }

        [HttpPost("createMedicalReferral")]
        public async Task<IActionResult> CreateMedicalReferralAsync([FromBody] CreateMedicalReferralRequestDto request)
        {
            var response = await _medicalReferralService.CreateMedicalReferralAsync(request);
            return Ok(response);
        }
    }
}
