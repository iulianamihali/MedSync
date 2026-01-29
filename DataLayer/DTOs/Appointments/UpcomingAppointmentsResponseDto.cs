using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.Appointments
{
    public class UpcomingAppointmentsResponseDto
    {
        public Guid AppointmentId { get; set; }
        public Guid? PatientId { get; set; }
        public string PatientName { get; set; }
        public DateTime DateTimeUtc { get; set; }
        public string Type { get; set; }
        public AppointmentStatusEnumType Status { get; set; }
    }
}
