using MedSync.DataLayer.Enums;
using Microsoft.EntityFrameworkCore.ValueGeneration;

namespace MedSync.DataLayer.DTOs.Appointments
{
    public class RecentAppointmentsDto
    {
        public Guid AppointmentId { get; set; }
        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public Guid InstitutionServiceId { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }
        public DateTime DateTimeUtc { get; set; }
        public decimal? Price { get; set; }
        public string Specialty { get; set; }
        public string Type { get; set; }
        public int Duration { get; set; }
        public AppointmentStatusEnumType Status { get; set; }
    }
}
