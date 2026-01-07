using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.DataLayer.DTOs.User;

namespace MedSync.Services.IServices
{
    public interface IInstitutionService
    {
        Task<string> GetInstitutionName(Guid institutionId);
        Task<bool> RegisterInstitutionAsync(InstitutionRequestDto requestDto);
        Task<int> CountInstitutionRequestsAsync();
        Task<List<InstitutionReqPopUpResponseDto>> GetInstitutionRequestDetailsAsync();
        Task<bool> UpdateStatusInstitutionRequestAsync(UpdateInstitutionRequestDto request);
        Task<PaginationDto<InstitutionsDataTableResponseDto>> GetInstitutionsDataTableAsync(int page);
        Task<bool> UpdateInstitutionsInfoAsync(UpdateInstitutionsInfoDto info);
        Task<List<SpecialtyWithServicesDto>> GetSpecialtiesWithServices(Guid institutionId);
        Task<List<DoctorDto>> GetDoctorsWithSlots(GetDoctorsWithSlotsRequestDto request);
        Task<PatientSearchResultDto?> SearchPatientsByPhone(SearchPatientsByPhoneRequestDto request);
        Task<PaginationDto<PatientsDataTableResponseDto>> GetDataTablePatients(int page, Guid institutionId);
        Task<PaginationDto<DoctorsDataTableResponseDto>> GetDataTableDoctors(int page, Guid institutionId);
    }
}
