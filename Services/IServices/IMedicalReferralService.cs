using MedSync.DataLayer.DTOs.Doctor;

namespace MedSync.Services.IServices
{
    public interface IMedicalReferralService
    {
        Task<bool> CreateMedicalReferralAsync(CreateMedicalReferralRequestDto request);

    }
}
