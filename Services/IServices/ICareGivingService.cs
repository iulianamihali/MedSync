using MedSync.DataLayer.DTOs.CareGiving;

namespace MedSync.Services.IServices
{
    public interface ICareGivingService
    {
        Task<bool> AddPersonAsync(AddPersonRequestDto request);
        Task<List<PersonsInCareResponseDto>> GetPersonsInCareAsync(Guid patientId);
    }
}
