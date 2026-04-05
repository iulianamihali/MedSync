namespace MedSync.DataLayer.DTOs.Institution
{
    public class GetDoctorsWithSlotsRequestDto
    {
        public Guid? DoctorId { get; set; }
        public Guid InstitutionId { get; set; }
        public Guid SpecialtyId { get; set; }
        public Guid ServiceId { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
    }
}
