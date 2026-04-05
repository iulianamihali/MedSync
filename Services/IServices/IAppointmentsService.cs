using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.Patient;

namespace MedSync.Services.IServices
{
    public interface IAppointmentsService
    {
        Task<List<CalendarAppointmentsDto>> GetCalendarAppointmentsAsync(
            CalendarAppointmentsRequestDto request
        );
        Task<bool> EditInfoAppointment(EditInfoAppointmentRequest request);
        Task<bool> AddAppointment(AddAppointmentRequestDto request);
        Task<List<UpcomingAppointmentsResponseDto>> GetUpcomingAppointmentsForDoctorAsync(
            Guid institutionId,
            Guid doctorId
        );
        Task<List<CalendarAppointmentsByDoctorResponseDto>> GetCalendarAppointmentsByDoctorAsync(
            CalendarAppointmentsRequestDto request
        );
        Task<PatientBasicInfoResponseDto> GetPatientBasicInfoAsync(Guid appointmentId);
    }
}
