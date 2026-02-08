namespace MedSync.DataLayer.DTOs.Institution
{
    public class AddServiceRequestDto
    {
        public Guid InstitutionId {  get; set; }
        public Guid SpecialtyId { get; set; }
        public Guid? DoctorId { get; set; }
        public List<Guid> Services { get; set; }
    }
}
