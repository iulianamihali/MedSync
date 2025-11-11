namespace MedSync.DataLayer.DTOs.User
{
    public class UpdateUserStatusRequestDto
    {
        public Guid Id { get; set; }
        public bool Value { get; set; }
    }
}
