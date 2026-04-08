using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.DTOs.Institution;

namespace MedSync.Services.IServices
{
    public interface IDoctorService
    {
        Task<CountsStatCardsResponseDto> GetDashboardCardStatsAsync(
            DashboardFilterRequestDto request
        );
        Task<PaginationDto<PatientsDataTableResponseDto>> GetDataTableMyPatientsAsync(
            int page,
            Guid institutionid,
            Guid doctorId
        );
        Task<List<SpecialtyServicesResponseDto>> GetSpecialtyServicesByDoctorAsync(Guid doctorId);
        Task<bool> AddServiceAsync(AddServiceRequestDto request);
        Task<bool> DeleteSpecialtyAsync(List<Guid> doctorSpecialtyIds);
        Task<GetInfoDoctorResponseDto> GetInfoDoctorAsync(Guid doctorId);
        Task<GetDoctorFeedbackResponseDto> GetDoctorFeedbackAsync(
            Guid institutionId,
            Guid doctorId
        );
        Task<List<SpecialtyServicesResponseDto>> GetSpecialtyServicesByDoctorAsync(
            Guid doctorId,
            Guid institutionId
        );
        Task<DoctorAIContextDto> GetAIContextAsync(Guid doctorId, Guid institutionId);
        Task<List<DoctorPatientSummaryDto>> SearchPatientSummariesAsync(
            Guid doctorId,
            Guid institutionId,
            string patientName,
            DateTime? fromDate,
            DateTime? toDate
        );
        Task<List<AvailableSlotDto>> GetAvailableSlotsAsync(
            Guid doctorId,
            Guid institutionId,
            DateTime fromDate,
            DateTime toDate,
            int slotMinutes
        );
        Task<List<DoctorWorkingHoursDayDto>> GetWorkingHoursAsync(Guid doctorId, Guid institutionId);
        Task<bool> SaveWorkingHoursAsync(SaveDoctorWorkingHoursRequestDto request);
    }
}
