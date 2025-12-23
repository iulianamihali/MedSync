using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.Appointments
{
    public class CalendarAppointmentsDto
    {
        public Guid Id { get; set; }
        public AppointmentStatusEnumType Status { get; set; }
        public string Specialty { get; set; }
        public string Service { get; set; }
        public string DoctorName { get; set; }
        public string PatientName { get; set; }
        public DateTime StartDateTimeUtc { get; set; }
        public DateTime EndDateTimeUtc { get; set; }
        public decimal? StandardPrice { get; set; }
        public decimal? TotalPrice { get; set; }
        public int Duration { get; set; }
    }
}
