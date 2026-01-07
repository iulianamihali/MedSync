namespace MedSync.DataLayer.DTOs.Institution
{
    public class PatientsDataTableResponseDto
    {
        public Guid Id { get; set; }
        public string PatientName { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public int Visits { get; set; }
        public DateTime LastVisit {  get; set; }
    }
}
