using MedSync.DataLayer.DTOs.Auth;
using MedSync.Models;
using MedSync.Services;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace MedSync.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    public class GlobalDataController : ControllerBase
    {
        private readonly IGlobalDataService _globalDataService;
        public GlobalDataController(IGlobalDataService globalDataService)
        {
            _globalDataService = globalDataService;
        }

        [HttpGet("getSpecialties")]
        public async Task<IActionResult> GetSpecialties()
        {
            var result = await _globalDataService.GetSpecialties();
            return Ok(result);
        }
        [HttpGet("getServices")]
        public async Task<IActionResult> GetServicesAsync()
        {
            var result = await _globalDataService.GetServices();
            return Ok(result);
        }
        [HttpGet("getInstitutionSpecialties/{codeInstitution}")]
        public async Task<IActionResult> GetInstitutionSpecialties(string codeInstitution)
        {
            var result = await _globalDataService.GetInstitutionSpecialties(codeInstitution);
            return Ok(result);
        }

    }
}
