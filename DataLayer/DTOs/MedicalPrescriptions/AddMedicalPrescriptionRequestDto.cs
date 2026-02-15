namespace MedSync.DataLayer.DTOs.MedicalPrescriptions
{
    public class AddMedicalPrescriptionRequestDto
    {
        public Guid AppointmentId { get; set; }
        public string Diagnosis { get; set; }
        public List<MedicationItemDto> Medications { get; set; }
    }
}
