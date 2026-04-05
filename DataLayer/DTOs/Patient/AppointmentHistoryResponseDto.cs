using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace MedSync.DataLayer.DTOs.Patient
{
    public class AppointmentHistoryResponseDto
    {
        public Guid AppointmentId { get; set; }
        public String DoctorName { get; set; }
        public String Address { get; set; }
        public String Specialty { get; set; }
        public DateTime StartDateTime { get; set; }
        public String Service { get; set; }
    }
}
