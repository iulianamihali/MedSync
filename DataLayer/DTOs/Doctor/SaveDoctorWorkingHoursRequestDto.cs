namespace MedSync.DataLayer.DTOs.Doctor
{
    public class SaveDoctorWorkingHoursRequestDto
    {
        public Guid InstitutionId { get; set; }
        public Guid DoctorId { get; set; }
        public List<DoctorWorkingHoursDayDto> WorkingHours { get; set; } = [];
    }
}
