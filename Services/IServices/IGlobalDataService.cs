using MedSync.DataLayer.DTOs.GlobalData;
using MedSync.Models;

namespace MedSync.Services.IServices
{
    public interface IGlobalDataService
    {
        Task<List<SpecialtyDto>> GetSpecialties();
        Task<List<ServiceSelectDto>> GetServices();
        Task<List<SpecialtyDto>> GetInstitutionSpecialties(string codeInstitution);

    }
}
