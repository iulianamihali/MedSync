namespace MedSync.DataLayer.DTOs.LocalAdmin.Dashboard
{
    public class DoctorReqPopUpResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string DateOfBirth { get; set; }
        public string? PhoneNumber { get; set; }
        public string UniversityName { get; set; }
        public string Specialization { get; set; }
        public string MedicalLicenseNumber { get; set; }
        public string YearsOfExperience { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
