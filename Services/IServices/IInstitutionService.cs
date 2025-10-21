using MedSync.DataLayer.DTOs.Institution;

namespace MedSync.Services.IServices
{
    public interface IInstitutionService
    {
        Task<bool> RegisterInstitutionAsync(InstitutionRequestDto requestDto);
    }
}
