namespace MedSync.DataLayer.DTOs.Doctor
{
    public class GetInfoDoctorResponseDto
    {
        public Guid Id { get; set; }
        public string Specialties { get; set; }
        public int YearsOfExperience { get; set; }
        public string MedicalLicenseNumber { get; set; }
        public string UniversityName { get; set; }
    }
}
