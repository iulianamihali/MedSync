using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; }
        public Guid UserId { get; set; }
        public UserType Role { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }


    }
}
