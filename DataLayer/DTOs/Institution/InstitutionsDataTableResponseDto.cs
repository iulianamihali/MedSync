namespace MedSync.DataLayer.DTOs.Institution
{
    public class InstitutionsDataTableResponseDto
    {
        public Guid Id { get; set; }
        public string NameInstitution { get; set; }
        public string NameAdmin { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool status { get; set; }
    }
}
