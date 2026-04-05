using MedSync.DataLayer.DTOs.MedicalPrescriptions;

namespace MedSync.DataLayer.DTOs.Pdf
{
    public class MedicalPrescriptionPdfDto
    {
        public DateTime? IssuedAt { get; set; }

        public string InstitutionName { get; set; } = string.Empty;
        public string? InstitutionAddress { get; set; }
        public byte[]? InstitutionLogo { get; set; }

        public string PatientFirstName { get; set; } = string.Empty;
        public string PatientLastName { get; set; } = string.Empty;
        public string PatientCnp { get; set; } = string.Empty;
        public DateOnly? PatientDateOfBirth { get; set; }

        public string Diagnosis { get; set; } = string.Empty;
        public List<MedicationItemDto> Medications { get; set; } = new List<MedicationItemDto>();
        public string DoctorFullName { get; set; } = string.Empty;
    }
}
