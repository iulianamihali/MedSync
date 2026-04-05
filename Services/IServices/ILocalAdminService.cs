using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.DataLayer.DTOs.LocalAdmin.Dashboard;
using MedSync.DataLayer.Enums;

namespace MedSync.Services.IServices
{
    public interface ILocalAdminService
    {
        Task<CountsStatCardsResponseDto> GetDashboardStatCardsAsync(
            DashboardFilterRequestDto requestDto
        );
        Task<List<RecentAppointmentsDto>> GetDetailsRecentAppointmentsAsync(Guid institutionId);
        Task<bool> EditStatusAppointmentAsync(EditStatusAppointmentRequestDto request);
        Task<List<DoctorReqPopUpResponseDto>> GetDoctorRequestDetailsAsync(Guid institutionId);
        Task<bool> UpdateStatusDoctorRequestAsync(UpdateDoctorRequestDto request);
    }
}
