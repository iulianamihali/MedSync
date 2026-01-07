using MedSync.Attributes;
using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.DataLayer.Enums;
using MedSync.Services;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        [HttpGet("getSpecialtiesWithServices/{institutionId}")]
        public async Task<IActionResult> GetSpecialtiesWithServicesAsync(Guid institutionId)
        {
            var response = await _institutionService.GetSpecialtiesWithServices(institutionId);
            return Ok(response);
        }
        [HttpPost("getDoctors")]
        public async Task<IActionResult> GetDoctorsWithSlotsAsync([FromBody] GetDoctorsWithSlotsRequestDto request)
        {
            var response = await _institutionService.GetDoctorsWithSlots(request);
            return Ok(response);
        }
        [HttpPost("searchPatientsByPhone")]
        public async Task<IActionResult> SearchPatientsByPhoneAsync([FromBody] SearchPatientsByPhoneRequestDto request)
        {
            var response = await _institutionService.SearchPatientsByPhone(request);
            return Ok(response);
        }
        [HttpGet("getDataTablePatients/{page}/{institutionId}")]
        public async Task<IActionResult> GetDataTablePatients(int page, Guid institutionId)
        {
            var response = await _institutionService.GetDataTablePatients(page, institutionId);
            return Ok(response);
        }

        [HttpGet("getDataTableDoctors/{page}/{institutionId}")]
        public async Task<IActionResult> GetDataTableDoctorsAsync(int page, Guid institutionId)
        {
            var response = await _institutionService.GetDataTableDoctors(page, institutionId);
            return Ok(response);
        }

    }
}
