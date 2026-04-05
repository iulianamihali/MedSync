using MedSync.DataLayer.DTOs.Auth;
using MedSync.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public ActionResult<string> Login([FromBody] LoginRequestDto request)
        {
            var result = _authService.ValidateLogin(request);
            if (result == null)
                return Unauthorized();

            return Ok(result);
        }

        [HttpPost("signup")]
        public ActionResult<string> Signup([FromBody] SignupRequestDto request)
        {
            var result = _authService.RegisterUser(request);
            if (result == null)
                return BadRequest();
            return Ok(result);
        }
    }
}
