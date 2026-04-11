namespace MedSync.DataLayer.DTOs.Auth
{
    public class ResetPasswordRequestDto
    {
        public string Token { get; set; }
        public string Password { get; set; }
    }
}
