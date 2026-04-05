namespace MedSync.DataLayer.DTOs.Institution
{
    public class DoctorsDataTableResponseDto
    {
        public Guid Id { get; set; }
        public string DoctorName { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string Specialization { get; set; }
        public int YearsOfExperience { get; set; }
        public bool Status { get; set; }
    }
}
