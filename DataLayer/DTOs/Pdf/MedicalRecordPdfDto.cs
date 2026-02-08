namespace MedSync.DataLayer.DTOs.Pdf
{
    public class MedicalReportPdfDto
    {
     
        public string InstitutionName { get; set; } = string.Empty;
        public byte[]? InstitutionLogo { get; set; }
        public string DocumentTitle { get; set; } = "MEDICAL REPORT";
        public DateTime ConsultationDate { get; set; }

        public string PatientFullName { get; set; } = string.Empty;
        public DateOnly? PatientDateOfBirth { get; set; }
        public string PatientCnp { get; set; } = string.Empty;

        public string? Symptoms { get; set; }
        public string? Investigation { get; set; }
        public string? InvestigationResult { get; set; }
        public string? Diagnosis { get; set; }
        public string? Recommendations { get; set; }

        public string DoctorFullName { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
    }

}
