namespace MedSync.DataLayer.DTOs.Institution
{
    public class PatientDoctorCandidateDto
    {
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; }
        public int YearsOfExperience { get; set; }
        public Guid InstitutionId { get; set; }
        public string InstitutionName { get; set; }
        public double Rating { get; set; }
        public int TotalReviews { get; set; }
        public List<string> Specialties { get; set; } = [];
    }
}
