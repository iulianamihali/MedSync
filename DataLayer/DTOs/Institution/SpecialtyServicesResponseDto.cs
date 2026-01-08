namespace MedSync.DataLayer.DTOs.Institution
{
    public class SpecialtyServicesResponseDto
    {
        public Guid SpecialtyId { get; set; }
        public string SpecialtyName { get; set; }
        public List<InstitutionServiceDto> InstitutionServices { get; set; }
    }
}
