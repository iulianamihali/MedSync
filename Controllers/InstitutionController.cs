using Microsoft.AspNetCore.Mvc;
using MedSync.Services;
using MedSync.Services.IServices;
using MedSync.DataLayer.DTOs.Institution;
using Microsoft.AspNetCore.Authorization;
using MedSync.Attributes;
using MedSync.DataLayer.Enums;
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
        [AllowAnonymous]
        [HttpPost("registerInstitution")]
        public async Task<IActionResult> RegisterInstitution([FromBody] InstitutionRequestDto request)
        {
            var response = await _institutionService.RegisterInstitutionAsync(request);
            return Ok(response);
        }
        [HttpGet("countInstitutionRequests")]
        [AuthorizeUserType(UserType.GlobalAdmin)]
        public async Task<IActionResult> CountInstitutionRequests()
        {
            var response = await _institutionService.CountInstitutionRequestsAsync();
            return Ok(response);
        }
        [HttpGet("getInstitutionRequestsDetails")]
        [AuthorizeUserType(UserType.GlobalAdmin)]
        public async Task<IActionResult> GetInstitutionRequestsDetails()
        {
            var response = await _institutionService.GetInstitutionRequestDetailsAsync();
            return Ok(response);
        }
        [HttpPut("updateInstitutionRequest")]
        [AuthorizeUserType(UserType.GlobalAdmin)]
        public async Task<IActionResult> UpdateInstitutionRequest([FromBody] UpdateInstitutionRequestDto request)
        {
            var response = await _institutionService.UpdateStatusInstitutionRequestAsync(request);
            return Ok(response);
        }
        [HttpGet("getDataTableInstitutions/{page}")]
        [AuthorizeUserType(UserType.GlobalAdmin)]
        public async Task<IActionResult> GetDataTableInstitutions(int page)
        {
            var response = await _institutionService.GetInstitutionsDataTableAsync(page);
            return Ok(response);
        }
        [HttpPut("updateInstitutionsInfo")]
        [AuthorizeUserType(UserType.GlobalAdmin)]
        public async Task<IActionResult> UpdateInstitutionsInfo([FromBody] UpdateInstitutionsInfoDto info)
        {
            var response = await _institutionService.UpdateInstitutionsInfoAsync(info);
            return Ok(response);
        }
            

    }
}
