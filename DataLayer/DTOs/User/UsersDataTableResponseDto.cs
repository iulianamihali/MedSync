using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.User
{
    public class UsersDataTableResponseDto
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public UserType Role { get; set; }
        public string InstitutionName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool Status { get; set; }
    }
}
