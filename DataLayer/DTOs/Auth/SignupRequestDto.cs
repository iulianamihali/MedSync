using MedSync.DataLayer.Enums;
namespace MedSync.DataLayer.DTOs.Auth
{
    public class SignupRequestDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Gender { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public UserType Role { get; set; }
        public PatientDataDto? PatientData { get; set; }
        public DoctorDataDto? DoctorData { get; set; }

    }

    public class PatientDataDto
    {
        public string Cnp { get; set; }
        public string? InsuranceNumber { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
    }

    public class DoctorDataDto
    {
        public string? InstitutionCode { get; set; }
        public string Specialization { get; set; }
        public int YearsOfExperience { get; set; }
        public string LicenseNumber { get; set; }
        public string? UniversityName { get; set; }
    }
}
