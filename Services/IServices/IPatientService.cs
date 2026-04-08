using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.Patient;

namespace MedSync.Services.IServices
{
    public interface IPatientService
    {
        Task<PatientDetailsResponseDto> GetPatientDetailsAsync(Guid patientId);
        Task<List<PatientAppointmentsSummaryResponseDto>> GetPatientAppointmentsSummariesAsync(
            Guid institutionId,
            Guid doctorId,
            Guid patientId
        );
        Task<List<GetFutureAppointmentsResponseDto>> GetFutureAppointmentsAsync(Guid patientId);
        Task<List<ActiveMedicationResponseDto>> GetActiveMedicationsAsync(Guid patientId);
        Task<List<AppointmentHistoryResponseDto>> GetAppointmentHistoryAsync(Guid patientId);
        Task<AppointmentHistoryDetailsResponseDto> GetAppointmentHistoryDetailsResponseAsync(
            Guid appointmentId
        );
        Task<string> GenerateSharedLinkAsync(GenerateLinkRequestDto request);
        Task<ActiveLinkStatusResponseDto> GetActiveLinkStatusAsync(GenerateLinkRequestDto request);
        Task<bool> RevokeSharedLinkAsync(GenerateLinkRequestDto request);
        Task<PatientBasicInfoResponseDto> GetPatientBasicInfoAsync(Guid patientId);
        Task<PatientAIContextDto> GetAIContextAsync(Guid userId);
        Task<bool> LeaveReviewAsync(LeaveReviewRequestDto request);
    }
}
