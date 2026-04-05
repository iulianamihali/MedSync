namespace MedSync.DataLayer.DTOs.Institution
{
    public class UpdateInstitutionsInfoDto
    {
        public Guid Id { get; set; }
        public string InstitutionName { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string StreetAddress { get; set; }
        public string StreetNumber { get; set; }
        public string PostalCode { get; set; }
        public bool Status { get; set; }
    }
}
