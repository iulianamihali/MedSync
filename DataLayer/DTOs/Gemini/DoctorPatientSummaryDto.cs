namespace MedSync.DataLayer.DTOs.Gemini
{
    public class DoctorPatientSummaryDto
    {
        public Guid PatientId { get; set; }
        public string PatientName { get; set; }
        public bool IsRegistered { get; set; }
        public int Visits { get; set; }
        public DateTime? LastVisitUtc { get; set; }
        public List<string> Symptoms { get; set; } = [];
        public List<string> Diagnoses { get; set; } = [];
        public List<string> Medications { get; set; } = [];
        public List<string> Referrals { get; set; } = [];
        public List<string> Recommendations { get; set; } = [];
    }
}
