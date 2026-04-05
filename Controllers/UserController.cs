using MedSync.Attributes;
using MedSync.DataLayer.DTOs.User;
using MedSync.DataLayer.Enums;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("getDataTableUsers/{page}/{userType}")]
        [AuthorizeUserType(UserType.GlobalAdmin)]
        public async Task<IActionResult> GetDataTableUsersAsync(int page, UserType userType)
        {
            var result = await _userService.GetDataTableUsersAsync(page, userType);
            return Ok(result);
        }

        [HttpGet("getUserSettingsData/{id}")]
        [AuthorizeUserType(
            UserType.GlobalAdmin,
            UserType.LocalAdmin,
            UserType.Patient,
            UserType.Doctor
        )]
        public async Task<IActionResult> GetUserSettingsDataAsync(Guid id)
        {
            var result = await _userService.GetUserSettingsDataAsync(id);
            return Ok(result);
        }

        [HttpPut("editInfoUsers")]
        [AuthorizeUserType(
            UserType.GlobalAdmin,
            UserType.LocalAdmin,
            UserType.Patient,
            UserType.Doctor
        )]
        public async Task<IActionResult> EditInfoUsersAsync(UserSettingsDataResponseDto request)
        {
            var response = await _userService.EditInfoUsersAsync(request);
            return Ok(response);
        }

        [HttpPut("updateUserStatus")]
        [AuthorizeUserType(UserType.GlobalAdmin, UserType.LocalAdmin)]
        public async Task<IActionResult> UpdateUserStatusAsync(UpdateUserStatusRequestDto request)
        {
            var response = await _userService.UpdateUserStatusAsync(request);
            return Ok(response);
        }
    }
}
