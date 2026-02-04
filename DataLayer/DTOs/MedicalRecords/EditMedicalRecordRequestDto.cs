namespace MedSync.DataLayer.DTOs.MedicalRecords
{
    public class EditMedicalRecordRequestDto
    {
        public Guid AppointmentId { get; set; }
        public string? Investigation { get; set; }
        public string? InvestigationResult { get; set; }
        public string? Recommendations { get; set; }
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
    }
}
