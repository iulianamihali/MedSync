using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.Institution;

namespace MedSync.DataLayer.DTOs.Gemini
{
    public class DoctorAskResponseDto
    {
        public string? Message { get; set; }
        public List<CalendarAppointmentsByDoctorResponseDto>? UpcomingAppointments { get; set; }
        public List<DoctorPatientSummaryDto>? Patients { get; set; }
        public List<AvailableSlotDto>? AvailableSlots { get; set; }
    }
}
