using Azure;
using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.DTOs.MedicalReferrals;
using MedSync.DataLayer.DTOs.Pdf;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class MedicalReferralService : IMedicalReferralService
    {
        private readonly MedSyncContext _context;
        public MedicalReferralService(MedSyncContext context)
        {
            _context = context;
        }

        public async Task<Guid> CreateMedicalReferralAsync(CreateMedicalReferralRequestDto request)
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
            await _context.SaveChangesAsync();
            return obj.Id;
        }

        public async Task<MedicalReferralPdfDto> GetMedicalReferralPdfDataAsync(Guid medicalReferralId)
        {
            var medicalReferral = await _context.MedicalReferrals
                .Where(m => m.Id == medicalReferralId)
                .Select(x => new MedicalReferralPdfDto
                {
                    IssuedAt = x.CreatedAt,
                    InstitutionName = x.Appointment.Institution.Name,
                    InstitutionAddress = x.Appointment.Institution.Address != null
                     ? $"{x.Appointment.Institution.Address.Country}, {x.Appointment.Institution.Address.City}, {x.Appointment.Institution.Address.Street}, {x.Appointment.Institution.Address.Number}"
                        : "-",
                    PatientFirstName = x.Appointment.Patient != null ? x.Appointment.Patient.User.FirstName : x.Appointment.UnregisteredPatient.FirstName,
                    PatientLastName = x.Appointment.Patient != null ? x.Appointment.Patient.User.LastName : x.Appointment.UnregisteredPatient.LastName,
                    PatientCnp = x.Appointment.Patient != null ? x.Appointment.Patient.Cnp : x.Appointment.UnregisteredPatient.Cnp,
                    PatientDateOfBirth = x.Appointment.Patient != null ? x.Appointment.Patient.User.DateOfBirth : null,
                    ConsultationDate = x.CreatedAt,
                    SpecialtyName = x.Specialty.Name,
                    Diagnosis = x.SuspectedDiagnosis,
                    ReasonReferral = x.ReasonReferral,
                    RelevantClinicalInformation = x.RelevantClinicalInformation,
                    ExpirationDate = x.ExpirationDate,
                    DoctorFullName = $"{x.Appointment.Doctor.User.FirstName} {x.Appointment.Doctor.User.LastName}"

                })
                .FirstOrDefaultAsync();

            if (medicalReferral == null)
                return null;

            var logoPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "Assets",
                    "logos",
                    "logo.png"
                );
            if (File.Exists(logoPath))
            {
                medicalReferral.InstitutionLogo = File.ReadAllBytes(logoPath);
            }
            return medicalReferral;
        }

        public async Task<List<GetAppointmentReferralsResponseDto>> GetAppointmentReferralsAsync(Guid appointmentId)
        {
            var response = await _context.MedicalReferrals
                .Where(m => m.AppointmentId == appointmentId)
                .Select(x => new GetAppointmentReferralsResponseDto
                {
                    MedicalReferralId = x.Id,
                    SpecialtyName = x.Specialty.Name,
                    IssuedAt = x.CreatedAt,
                    ExpirationDate = x.ExpirationDate,
                    SuspectedDiagnosis = x.SuspectedDiagnosis
                })
                .OrderByDescending(x => x.IssuedAt)
                .ToListAsync();
            return response;
        }


    }
}
