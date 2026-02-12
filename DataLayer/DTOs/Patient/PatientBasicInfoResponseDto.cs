namespace MedSync.DataLayer.DTOs.Patient
{
    public class PatientBasicInfoResponseDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public DateOnly? DateOfBirth { get; set; }
    }
}
