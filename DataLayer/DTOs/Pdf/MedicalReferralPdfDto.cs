namespace MedSync.DataLayer.DTOs.Pdf
{
    public class MedicalReferralPdfDto
    {
        public string DocumentTitle { get; set; } = "Medical Referral";
        public DateTime? IssuedAt { get; set; }

        public string InstitutionName { get; set; } = string.Empty;
        public string? InstitutionAddress { get; set; }
        public byte[]? InstitutionLogo { get; set; }

        public string PatientFirstName { get; set; } = string.Empty;
        public string PatientLastName { get; set; } = string.Empty;

        public string PatientCnp { get; set; } = string.Empty;
        public DateOnly? PatientDateOfBirth { get; set; }

        public DateTime? ConsultationDate { get; set; }

        public string SpecialtyName { get; set; } = string.Empty;
        public string? Diagnosis { get; set; }
        public string ReasonReferral { get; set; } = string.Empty;
        public string? RelevantClinicalInformation { get; set; }
        public DateTime? ExpirationDate { get; set; }

        public string DoctorFullName { get; set; } = string.Empty;
    }
}
