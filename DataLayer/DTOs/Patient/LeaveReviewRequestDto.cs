namespace MedSync.DataLayer.DTOs.Patient
{
    public class LeaveReviewRequestDto
    {
        public Guid PatientId { get; set; }
        public Guid AppointmentId { get; set; }
        public int Rating { get; set; } 
        public string? Comment { get; set; } 
    }
}
