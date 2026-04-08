namespace MedSync.DataLayer.DTOs.Doctor
{
    public class DoctorWorkingHoursDayDto
    {
        public string Day { get; set; } = string.Empty;
        public bool Enabled { get; set; }
        public string Start { get; set; } = string.Empty;
        public string End { get; set; } = string.Empty;
    }
}
