namespace MedSync.DataLayer.DTOs.Institution
{
    public class SpecialtyWithServicesDto
    {
        public Guid SpecialtyId{ get; set; }
        public string SpecialtyName { get; set; }
        public List<ServiceDto> Services { get; set; }
    }
}
