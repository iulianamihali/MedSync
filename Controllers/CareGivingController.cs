using MedSync.Attributes;
using MedSync.DataLayer.DTOs.CareGiving;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.Patient, UserType.Doctor)]
    public class CareGivingController : ControllerBase
    {
        private readonly ICareGivingService _careGivingService;
        public CareGivingController(ICareGivingService careGivingService)
        {
            _careGivingService = careGivingService;
        }
        [HttpPost("add-person")]
        public async Task<IActionResult> AddPerson([FromBody] AddPersonRequestDto request)
        {
            var result = await _careGivingService.AddPersonAsync(request);
            return Ok(result);
        }

        [HttpGet("persons-in-care/{patientId}")]
        public async Task<IActionResult> GetPersonsInCare(Guid patientId)
        {
            var result = await _careGivingService.GetPersonsInCareAsync(patientId);
            return Ok(result);
        }
    }
}
