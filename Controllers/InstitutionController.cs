using MedSync.Attributes;
using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.GlobalData;
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

        [HttpGet("getInstitutionName/{institutionId}")]
        [AuthorizeUserType(UserType.LocalAdmin, UserType.Doctor)]
        public async Task<IActionResult> GetInstitutionName(Guid institutionId)
        {
            var response = await _institutionService.GetInstitutionName(institutionId);
            return Ok(response);
        }

        [AllowAnonymous]
        [HttpPost("registerInstitution")]
        public async Task<IActionResult> RegisterInstitution(
            [FromBody] InstitutionRequestDto request
        )
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
        public async Task<IActionResult> UpdateInstitutionRequest(
            [FromBody] UpdateInstitutionRequestDto request
        )
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
        public async Task<IActionResult> UpdateInstitutionsInfo(
            [FromBody] UpdateInstitutionsInfoDto info
        )
        {
            var response = await _institutionService.UpdateInstitutionsInfoAsync(info);
            return Ok(response);
        }

        [HttpGet("getSpecialtiesWithServices/{institutionId}")]
        [AuthorizeUserType(UserType.LocalAdmin, UserType.Doctor, UserType.Patient)]
        public async Task<IActionResult> GetSpecialtiesWithServicesAsync(Guid institutionId)
        {
            var response = await _institutionService.GetSpecialtiesWithServices(institutionId);
            return Ok(response);
        }

        [HttpPost("getDoctors")]
        [AuthorizeUserType(UserType.LocalAdmin, UserType.Doctor)]
        public async Task<IActionResult> GetDoctorsWithSlotsAsync(
            [FromBody] GetDoctorsWithSlotsRequestDto request
        )
        {
            var response = await _institutionService.GetDoctorsWithSlots(request);
            return Ok(response);
        }

        [HttpPost("searchPatientsByPhone")]
        [AuthorizeUserType(UserType.LocalAdmin, UserType.Doctor)]
        public async Task<IActionResult> SearchPatientsByPhoneAsync(
            [FromBody] SearchPatients request
        )
        {
            var response = await _institutionService.SearchPatients(request);
            return Ok(response);
        }

        [HttpGet("getDataTablePatients/{page}/{institutionId}")]
        [AuthorizeUserType(UserType.LocalAdmin)]
        public async Task<IActionResult> GetDataTablePatients(int page, Guid institutionId)
        {
            var response = await _institutionService.GetDataTablePatients(page, institutionId);
            return Ok(response);
        }

        [HttpGet("getDataTableDoctors/{page}/{institutionId}")]
        [AuthorizeUserType(UserType.LocalAdmin)]
        public async Task<IActionResult> GetDataTableDoctorsAsync(int page, Guid institutionId)
        {
            var response = await _institutionService.GetDataTableDoctors(page, institutionId);
            return Ok(response);
        }

        [HttpGet("getSpecialtyServices/{institutionId}")]
        [AuthorizeUserType(UserType.LocalAdmin)]
        public async Task<IActionResult> GetSpecialtyServicesAsync(Guid institutionId)
        {
            var response = await _institutionService.GetSpecialtyServices(institutionId);
            return Ok(response);
        }

        [HttpPost("addService")]
        [AuthorizeUserType(UserType.LocalAdmin)]
        public async Task<IActionResult> AddServiceAsync(AddServiceRequestDto request)
        {
            var response = await _institutionService.AddService(request);
            return Ok(response);
        }

        [HttpPut("editDataService")]
        [AuthorizeUserType(UserType.LocalAdmin)]
        public async Task<IActionResult> EditDataServiceAsync(
            [FromBody] EditDataServiceRequestDto request
        )
        {
            var response = await _institutionService.EditDataService(request);
            return Ok(response);
        }

        [HttpDelete("deleteService/{institutionServiceId}")]
        [AuthorizeUserType(UserType.LocalAdmin)]
        public async Task<IActionResult> DeleteServiceAsync(Guid institutionServiceId)
        {
            var response = await _institutionService.DeleteService(institutionServiceId);
            return Ok(response);
        }

        [HttpDelete("deleteSpecialty")]
        [AuthorizeUserType(UserType.LocalAdmin)]
        public async Task<IActionResult> DeleteSpecialtyAsync(
            [FromBody] DeleteSpecialtyRequestDto request
        )
        {
            var result = await _institutionService.DeleteSpecialty(request);
            return Ok(result);
        }

        [HttpGet("getSpecialties/{institutionId}")]
        [AuthorizeUserType(UserType.LocalAdmin, UserType.Doctor)]
        public async Task<IActionResult> GetSpecialtiesAsync(Guid institutionId)
        {
            var response = await _institutionService.GetSpecialtiesAsync(institutionId);
            return Ok(response);
        }

        [HttpGet("getServices/{institutionId}")]
        [AuthorizeUserType(UserType.LocalAdmin, UserType.Doctor)]
        public async Task<IActionResult> GetServicesAsync(Guid institutionId)
        {
            var response = await _institutionService.GetServicesAsync(institutionId);
            return Ok(response);
        }

        [HttpGet("getInstitutionDetails/{institutionId}")]
        [AuthorizeUserType(UserType.Patient)]
        public async Task<IActionResult> GetInstitutionDetailsAsync(Guid institutionId)
        {
            var response = await _institutionService.GetInstitutionDetailsAsync(institutionId);
            return Ok(response);
        }

        [HttpPost("getAvailableDoctors")]
        [AuthorizeUserType(UserType.Patient)]
        public async Task<IActionResult> GetAvailableDoctorsAsync(
            [FromBody] GetDoctorsWithSlotsRequestDto request
        )
        {
            var response = await _institutionService.GetDoctorsAvailabilityAsync(request);
            return Ok(response);
        }

        [HttpGet("getDoctorsTab/{institutionId}")]
        [AuthorizeUserType(UserType.Patient)]
        public async Task<IActionResult> GetDoctorsAsync(Guid institutionId)
        {
            var response = await _institutionService.GetDoctorsInfoTabAsync(institutionId);
            return Ok(response);
        }

        [HttpPost("getAvailableSlotsDoctor")]
        [AuthorizeUserType(UserType.Patient)]
        public async Task<IActionResult> GetAvailableSlotsDoctorAsync(
            [FromBody] GetDoctorsWithSlotsRequestDto request
        )
        {
            var response = await _institutionService.GetAvailableSlotsByDoctorAsync(request);
            return Ok(response);
        }
    }
}
