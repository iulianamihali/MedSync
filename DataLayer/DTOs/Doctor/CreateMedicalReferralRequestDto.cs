namespace MedSync.DataLayer.DTOs.Doctor
{
    public class CreateMedicalReferralRequestDto
    {
        public Guid SpecialtyId { get; set; }
        public Guid AppointmentId { get; set; }
        public string ReasonReferral { get; set; }
        public string SuspectedDiagnosis { get; set; }
        public string RelevantClinicalInformation { get; set; }
        public int ValidityInDays { get; set; }
    }
}
