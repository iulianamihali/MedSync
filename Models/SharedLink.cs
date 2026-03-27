namespace MedSync.Models
{
    public class SharedLink
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string Token { get; set; }
        public bool IsActive { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }

        public Patient Patient { get; set; }
    }
}
