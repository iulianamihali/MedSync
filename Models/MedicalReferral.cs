namespace MedSync.Models
{
    public class MedicalReferral
    {
        public Guid Id { get; set; }
        public Guid SpecialtyId { get; set; }
        public Guid AppointmentId { get; set; }
        public string ReasonReferral { get; set; }
        public string SuspectedDiagnosis { get; set; }
        public string RelevantClinicalInformation { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public virtual Appointment Appointment { get; set; }
        public virtual Specialty Specialty { get; set; }


    }
}
