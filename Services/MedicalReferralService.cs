using MedSync.DataLayer.DTOs.Doctor;
using MedSync.Models;
using MedSync.Services.IServices;

namespace MedSync.Services
{
    public class MedicalReferralService : IMedicalReferralService
    {
        private readonly MedSyncContext _context;
        public MedicalReferralService(MedSyncContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateMedicalReferralAsync(CreateMedicalReferralRequestDto request)
        {
            var obj = new MedicalReferral
            {
                Id = Guid.NewGuid(),
                SpecialtyId = request.SpecialtyId,
                AppointmentId = request.AppointmentId,
                ReasonReferral = request.ReasonReferral,
                SuspectedDiagnosis = request.SuspectedDiagnosis,
                RelevantClinicalInformation = request.RelevantClinicalInformation,
                CreatedAt = DateTime.UtcNow,
                ExpirationDate = DateTime.UtcNow.AddDays(request.ValidityInDays)
            };
            _context.MedicalReferrals.Add(obj);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
