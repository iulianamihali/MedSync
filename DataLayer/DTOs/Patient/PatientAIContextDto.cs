namespace MedSync.DataLayer.DTOs.Patient
{
    public class PatientAIContextDto
    {
        public String PatientName { get; set; }
        public String Gender { get; set; }
        public int Age { get; set; }
        public string? LastAppointmentSummary { get; set; }
        public decimal TotalSpentOnAppointments { get; set; }
        public List<string> AppointmentSpendingDetails { get; set; }
        public List<string> Diagnoses { get; set; }
        public List<string> Symptoms { get; set; }
        public List<string> Recommendations { get; set; }
        public List<string> Medications { get; set; }
        public List<string> Referrals { get; set; }
        public List<string> Doctors { get; set; }
    }
}
