using MedSync.Services;
using Microsoft.AspNetCore.Mvc;
using MedSync.DataLayer.DTOs.Auth;
using Microsoft.AspNetCore.Authorization;
using MedSync.Services.IServices;
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

    }
}
