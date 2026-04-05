using MedSync.Attributes;
using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.Doctor, UserType.Patient)]
    public class DoctorController : ControllerBase
    {
        private readonly IDoctorService _doctorService;

        public DoctorController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }

        [HttpGet("dashboardStatsCards")]
        public async Task<IActionResult> GetDashboardCardStatsAsync(
            [FromQuery] DashboardFilterRequestDto request
        )
        {
            var response = await _doctorService.GetDashboardCardStatsAsync(request);
            return Ok(response);
        }

        [HttpGet("getDataTableMyPatients/{page}/{institutionId}/{doctorId}")]
        public async Task<IActionResult> GetDataTableMyPatientsAsync(
            int page,
            Guid institutionId,
            Guid doctorId
        )
        {
            var response = await _doctorService.GetDataTableMyPatientsAsync(
                page,
                institutionId,
                doctorId
            );
            return Ok(response);
        }

        [HttpGet("getSpecialtyServicesByDoctor/{doctorId}")]
        public async Task<IActionResult> GetSpecialtyServicesByDoctor(Guid doctorId)
        {
            var response = await _doctorService.GetSpecialtyServicesByDoctorAsync(doctorId);
            return Ok(response);
        }

        [HttpPost("addService")]
        public async Task<IActionResult> AddServiceAsync([FromBody] AddServiceRequestDto request)
        {
            var response = await _doctorService.AddServiceAsync(request);
            return Ok(response);
        }

        [HttpDelete("deleteSpecialty")]
        public async Task<IActionResult> DeleteSpecialtyAsync(
            [FromBody] List<Guid> doctorSpecialtyIds
        )
        {
            var response = await _doctorService.DeleteSpecialtyAsync(doctorSpecialtyIds);
            return Ok(response);
        }

        [HttpGet("getInfoDoctor/{doctorId}")]
        public async Task<IActionResult> GetInfoDoctorAsync(Guid doctorId)
        {
            var response = await _doctorService.GetInfoDoctorAsync(doctorId);
            return Ok(response);
        }

        [HttpGet("getDoctorFeedback/{institutionId}/{doctorId}")]
        public async Task<IActionResult> GetDoctorFeedbackAsync(Guid institutionId, Guid doctorId)
        {
            var response = await _doctorService.GetDoctorFeedbackAsync(institutionId, doctorId);
            return Ok(response);
        }

        [HttpGet("getSpecialtyServicesByDoctor/{doctorId}/{institutionId}")]
        public async Task<IActionResult> GetSpecialtyServicesByDoctor(
            Guid doctorId,
            Guid institutionId
        )
        {
            var response = await _doctorService.GetSpecialtyServicesByDoctorAsync(
                doctorId,
                institutionId
            );
            return Ok(response);
        }
    }
}
