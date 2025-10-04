using MedSync.Services;
using Microsoft.AspNetCore.Mvc;
using MedSync.DataLayer.DTOs.Auth;
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
        public ActionResult<LoginResponseDto> Login([FromBody] LoginRequestDto request)
        {
            var result = _authService.ValidateLogin(request);
            if (result == null)
                return Unauthorized();

            return Ok(result);
        }

        [HttpPost("signup")]
        public ActionResult<LoginResponseDto> Signup([FromBody] SignupRequestDto request)
        {
            var result = _authService.RegisterUser(request);
            return Ok(result);
        }
    }
}
