namespace MedSync.Models
{
    public class DoctorSpecialty
    {
        public Guid DoctorId { get; set; }
        public Guid SpecialtyId { get; set; }
        public virtual Doctor Doctor { get; set; }
        public virtual Specialty Specialty { get; set; }
    }
}
