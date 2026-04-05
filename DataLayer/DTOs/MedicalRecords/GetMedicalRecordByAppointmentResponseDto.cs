using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.MedicalRecords
{
    public class GetMedicalRecordByAppointmentResponseDto
    {
        public Guid AppointmentId { get; set; }
        public string PatientName { get; set; }
        public string Cnp { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public int? Age { get; set; }
        public string? Investigation { get; set; }
        public string? InvestigationResult { get; set; }
        public string? Recommendations { get; set; }
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public AppointmentStatusEnumType AppointmentStatus { get; set; }
    }
}
