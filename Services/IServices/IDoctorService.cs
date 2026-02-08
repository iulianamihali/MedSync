using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.DTOs.Institution;

namespace MedSync.Services.IServices
{
    public interface IDoctorService
    {
        Task<CountsStatCardsResponseDto> GetDashboardCardStatsAsync(DashboardFilterRequestDto request);
        Task<PaginationDto<PatientsDataTableResponseDto>> GetDataTableMyPatientsAsync(int page, Guid institutionid, Guid doctorId);
        Task<List<SpecialtyServicesResponseDto>> GetSpecialtyServicesByDoctorAsync(Guid doctorId);
        Task<bool> AddServiceAsync(AddServiceRequestDto request);
        Task<bool> DeleteSpecialtyAsync(List<Guid> doctorSpecialtyIds);
    }
}
