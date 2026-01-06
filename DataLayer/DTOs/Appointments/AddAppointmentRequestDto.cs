using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.Appointments
{
    public class AddAppointmentRequestDto
    {
        public Guid? PatientId { get; set; }
        public Guid? UnregisteredPatientId { get; set; }

        public string? PhoneNumber { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }

        public Guid InstitutionId { get; set; }
        public Guid SpecialtyId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid DoctorId { get; set; }
        public DateTime startTime { get; set; }
        public string ReferralCode { get; set; }

    }
}
