namespace MedSync.DataLayer.DTOs.Institution
{
    public class InstitutionReqPopUpResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string TaxIdentificationNumber { get; set; }
        public string? PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string StreetAddress { get; set; }
        public string StreetNumber { get; set; }
        public DateTime CreatedAt { get; set; }

    }

}