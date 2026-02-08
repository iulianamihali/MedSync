using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.Patient
{
    public class PatientAppointmentsSummaryResponseDto
    {
        public Guid MedicalRecordId { get; set; }
        public Guid AppointmentId { get; set; }
        public DateTime Date { get; set; }
        public AppointmentStatusEnumType Status { get; set; }
        public string Service { get; set; }
        public string Diagnosis { get; set; }
    }
}
