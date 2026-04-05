namespace MedSync.DataLayer.DTOs.Doctor
{
    public class DoctorAIContextDto
    {
        public string DoctorName { get; set; }
        public string InstitutionName { get; set; }
        public int YearsOfExperience { get; set; }
        public string? UniversityName { get; set; }
        public List<string> Specialties { get; set; }
        public List<string> Services { get; set; }
        public List<DoctorScheduleDto> Schedule { get; set; }
    }
}
