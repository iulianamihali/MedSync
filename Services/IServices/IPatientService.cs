using MedSync.DataLayer.DTOs.Patient;

namespace MedSync.Services.IServices
{
    public interface IPatientService
    {
        Task<PatientDetailsResponseDto> GetPatientDetailsAsync(Guid patientId);
        Task<List<PatientAppointmentsSummaryResponseDto>> GetPatientAppointmentsSummariesAsync(Guid institutionId, Guid doctorId, Guid patientId);
    }
}
