namespace MedSync.DataLayer.DTOs.MedicalReferrals
{
    public class GetAppointmentReferralsResponseDto
    {
        public Guid MedicalReferralId { get; set; }
        public string SpecialtyName { get; set; }
        public DateTime? IssuedAt { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public string SuspectedDiagnosis { get; set; }

    }
}
