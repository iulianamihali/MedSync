using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.DTOs.Pdf;

namespace MedSync.Services.IServices
{
    public interface IMedicalReferralService
    {
        Task<Guid> CreateMedicalReferralAsync(CreateMedicalReferralRequestDto request);
        Task<MedicalReferralPdfDto> GetMedicalReferralPdfDataAsync(Guid medicalReferralId);
    }
}
