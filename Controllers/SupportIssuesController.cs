using MedSync.Attributes;
using MedSync.DataLayer.DTOs.SupportIssue;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(
        UserType.GlobalAdmin,
        UserType.LocalAdmin,
        UserType.Doctor,
        UserType.Patient
    )]
    public class SupportIssuesController : ControllerBase
    {
        private readonly ISupportIssuesService _supportIssuesService;

        public SupportIssuesController(ISupportIssuesService supportIssuesService)
        {
            _supportIssuesService = supportIssuesService;
        }

        [HttpPost("addSupportIssue")]
        public async Task<IActionResult> AddSupportIssue(
            [FromBody] AddSupportIssueRequestDto request
        )
        {
            var result = await _supportIssuesService.AddSupportIssueAsync(request);
            return Ok(result);
        }

        [HttpGet("getSupportIssues/{page}")]
        public async Task<IActionResult> GetSupportIssues(int page)
        {
            var result = await _supportIssuesService.GetSupportIssuesAsync(page);
            return Ok(result);
        }

        [HttpPatch("updateStatus")]
        public async Task<IActionResult> UpdateSupportIssueStatus(
            [FromQuery] Guid id,
            [FromQuery] StatusSupportEnumType status
        )
        {
            var result = await _supportIssuesService.UpdateSupportIssueStatusAsync(id, status);
            if (!result)
                return BadRequest();
            return Ok(result);
        }
    }
}
