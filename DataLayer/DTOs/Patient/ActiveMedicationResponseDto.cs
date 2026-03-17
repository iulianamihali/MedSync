using MedSync.DataLayer.DTOs.MedicalPrescriptions;

namespace MedSync.DataLayer.DTOs.Patient
{
    public class ActiveMedicationResponseDto
    {
        public Guid PrescriptionId { get; set; }
        public String DoctorName { get; set; }
        public String Diagnosis { get; set; }
        public DateTime PrescribedAt { get; set; }
        public List<MedicationItemDto> MedicationItems { get; set; }
    }
}
