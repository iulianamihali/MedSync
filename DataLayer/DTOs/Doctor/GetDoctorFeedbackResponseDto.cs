namespace MedSync.DataLayer.DTOs.Doctor
{
    public class GetDoctorFeedbackResponseDto
    {
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public List<DoctorReviewItemDto> Reviews { get; set; } = new();
    }
}
