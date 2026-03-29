namespace MedSync.DataLayer.DTOs.Appointments
{
    public class GenerateLinkRequestDto
    {
        public Guid PatientId { get; set; }
        public Guid? CareUnregisteredPatientId { get; set; }
    }
}
