using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.Patient
{
    public class GetFutureAppointmentsResponseDto
    {
        public Guid AppointmentId { get; set; }
        public AppointmentStatusEnumType StatusAppointment { get; set; }
        public String SpecialtyName { get; set; }
        public DateTime StartDateTimeUtc { get; set; }
        public DateTime EndDateTimeUtc { get; set; }
        public String InstitutionName { get; set; }
        public String Address { get; set; }
        public String DoctorName { get; set; }  
    }
}
