namespace MedSync.DataLayer.DTOs.Institution
{
    public class InstitutionServiceDto
    {
        public Guid? DoctorSpecialtyId { get; set; }
        public Guid Id { get; set; }
        public Guid ServiceId { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int Duration { get; set; }
    }
}
