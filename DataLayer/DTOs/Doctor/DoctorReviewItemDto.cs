namespace MedSync.DataLayer.DTOs.Doctor
{
    public class DoctorReviewItemDto
    {
        public Guid ReviewId { get; set; }
        public string PatientName { get; set; }
        public decimal Rating { get; set; }
        public string Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
