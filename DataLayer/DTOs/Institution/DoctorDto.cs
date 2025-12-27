namespace MedSync.DataLayer.DTOs.Institution
{
    public class DoctorDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public List<AvailableSlotDto> Slots { get; set; }
    }
}
