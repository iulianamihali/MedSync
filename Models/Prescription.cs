namespace MedSync.Models
{
    public class Prescription
    {
        public Guid Id { get; set; }
        public Guid AppointmentId { get; set; }
        public string Diagnosis { get; set; }
        public virtual Appointment Appointment { get; set; }
        public virtual ICollection<Medication> Medications { get; set; }
    }
}
