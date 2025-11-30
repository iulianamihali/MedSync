using MedSync.DataLayer.Enums;
using Microsoft.EntityFrameworkCore.ValueGeneration;

namespace MedSync.DataLayer.DTOs
{
    public class AppointmentDto
    {
        public Guid AppointmentId { get; set; }
        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }
        public DateTime DateTimeUtc { get; set; }
        public int? Price { get; set; }
        public string Type { get; set; }
        public AppointmentStatusEnumType Status { get; set; }
    }
}
