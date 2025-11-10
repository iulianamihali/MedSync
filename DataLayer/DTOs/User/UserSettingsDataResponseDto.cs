namespace MedSync.DataLayer.DTOs.User
{
    public class UserSettingsDataResponseDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string StreetAddress { get; set; }
        public string StreetNumber { get; set; }
        public string PostalCode { get; set; }
    }
}
