namespace MedSync.DataLayer.DTOs.Institution
{
    public class DeleteSpecialtyRequestDto
    {
        public Guid InstitutionId { get; set; }
        public Guid SpecialtyId { get; set; }
    }
}
