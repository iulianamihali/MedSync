namespace MedSync.DataLayer.DTOs.MedicalPrescriptions
{
    public class GetAppointmentPrescriptionsResponseDto
    {
        public Guid PrescriptionId {  get; set; }
        public string Diagnosis {  get; set; }
        public DateTime? IssuedAt { get; set; }
        public DateTime? ExpirationDate { get; set; }

    }
}
