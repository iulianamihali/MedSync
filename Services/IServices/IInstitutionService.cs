using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Institution;

namespace MedSync.Services.IServices
{
    public interface IInstitutionService
    {
        Task<bool> RegisterInstitutionAsync(InstitutionRequestDto requestDto);
        Task<int> CountInstitutionRequestsAsync();
        Task<List<InstitutionReqPopUpResponseDto>> GetInstitutionRequestDetailsAsync();
        Task<bool> UpdateStatusInstitutionRequestAsync(UpdateInstitutionRequestDto request);
        Task<PaginationDto<InstitutionsDataTableResponseDto>> GetInstitutionsDataTableAsync(int page);
        Task<bool> UpdateInstitutionsInfoAsync(UpdateInstitutionsInfoDto info); 
    }
}
