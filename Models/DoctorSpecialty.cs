namespace MedSync.Models
{
    public class DoctorSpecialty
    {
        public Guid Id { get; set; }
        public Guid DoctorUserId { get; set; }
        public Guid InstitutionServiceId { get; set; }
        public virtual Doctor Doctor { get; set; }

        public virtual InstitutionService InstitutionService { get; set; }
    }
}
