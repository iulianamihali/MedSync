using Microsoft.AspNetCore.Mvc;
using MedSync.Services;
using MedSync.Services.IServices;
using MedSync.DataLayer.DTOs.Institution;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class InstitutionController : ControllerBase
    {
       
        private readonly IInstitutionService _institutionService;
        public InstitutionController(IInstitutionService institutionService)
        {
            _institutionService = institutionService;
        }
        [HttpPost("registerInstitution")]
        public async Task<IActionResult> RegisterInstitution([FromBody] InstitutionRequestDto request)
        {
            var response = await _institutionService.RegisterInstitutionAsync(request);
            return Ok(response);
        }
        [HttpGet("countInstitutionRequests")]
        public async Task<IActionResult> CountInstitutionRequests()
        {
            var response = await _institutionService.CountInstitutionRequestsAsync();
            return Ok(response);
        }
        [HttpGet("getInstitutionRequestsDetails")]
        public async Task<IActionResult> GetInstitutionRequestsDetails()
        {
            var response = await _institutionService.GetInstitutionRequestDetailsAsync();
            return Ok(response);
        }
        [HttpPut("updateInstitutionRequest")]
        public async Task<IActionResult> UpdateInstitutionRequest([FromBody] UpdateInstitutionRequestDto request)
        {
            var response = await _institutionService.UpdateStatusInstitutionRequestAsync(request);
            return Ok(response);
        }

    }
}
