using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.Appointments
{
    public class CalendarAppointmentsByDoctorResponseDto
    {
        public Guid Id { get; set; }
        public AppointmentStatusEnumType Status { get; set; }
        public string Service { get; set; }
        public string PatientName { get; set; }
        public DateTime StartDateTimeUtc { get; set; }
        public DateTime EndDateTimeUtc { get; set; }
        public int Duration { get; set; }
    }
}
