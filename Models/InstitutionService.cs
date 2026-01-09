namespace MedSync.Models
{
    public class InstitutionService
    {
        public Guid Id { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Duration {  get; set; }
        public Guid InstitutionId { get; set; }
        public Guid SpecialtyId { get; set; }
        public Guid ServiceId { get; set; }
        public virtual Institution Institution { get; set; }
        public virtual Specialty Specialty { get; set; }
        public virtual Service Service { get; set; }
        public virtual ICollection<Appointment> Appointments { get; set; }

    }
}
