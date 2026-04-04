using MedSync.Attributes;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.Patient)]
    public class GeminiController : ControllerBase
    {
        private readonly IGeminiService _geminiService;
        public GeminiController(IGeminiService geminiService)
        {
            _geminiService = geminiService;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] AskRequestDto request)
        {
            var response = await _geminiService.AskAsync(request);
            return Ok(response);
        }
    }
}
