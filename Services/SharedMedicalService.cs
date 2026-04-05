using System.Security.Cryptography;
using System.Text;
using MedSync.DataLayer.DTOs.MedicalPrescriptions;
using MedSync.DataLayer.DTOs.MedicalReferrals;
using MedSync.DataLayer.DTOs.Patient;
using MedSync.DataLayer.DTOs.SharedMedical;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class SharedMedicalService
    {
        private readonly MedSyncContext _context;
        private readonly IConfiguration _configuration;
        private readonly IPatientService _patientService;
        private readonly IMedicalPrescriptionService _medicalPrescriptionService;
        private readonly IMedicalReferralService _medicalReferralService;

        public SharedMedicalService(
            MedSyncContext context,
            IConfiguration configuration,
            IPatientService patientService,
            IMedicalPrescriptionService medicalPrescriptionService,
            IMedicalReferralService medicalReferralService
        )
        {
            _context = context;
            _configuration = configuration;
            _patientService = patientService;
            _medicalPrescriptionService = medicalPrescriptionService;
            _medicalReferralService = medicalReferralService;
        }

        public Guid? ValidateTokenAsync(string token)
        {
            var decodeToken = Encoding.UTF8.GetString(Convert.FromBase64String(token));
            var lastColon = decodeToken.LastIndexOf(':');
            var message = decodeToken.Substring(0, lastColon);
            var signature = decodeToken.Substring(lastColon + 1);

            var secretKey = _configuration["SharedLinks:SecretKey"];
            var keyBytes = Convert.FromBase64String(secretKey);
            var messageBytes = Encoding.UTF8.GetBytes(message);

            using var hmac = new HMACSHA256(keyBytes);
            var recalculatedSignature = Convert.ToBase64String(hmac.ComputeHash(messageBytes));

            if (signature != recalculatedSignature)
                return null;

            var patientIdString = message.Substring(0, message.IndexOf(':'));
            return Guid.Parse(patientIdString);
        }

        public async Task<SharedMedicalHistoryResponseDto> GetSharedMedicalHistoryAsync(
            string token
        )
        {
            var patientId = ValidateTokenAsync(token);

            if (patientId == null)
                return null;

            var sharedLink = await _context.SharedLinks.FirstOrDefaultAsync(s =>
                s.Token == token && s.IsActive && s.ExpiresAt > DateTime.UtcNow
            );

            if (sharedLink == null)
                return null;

            var history = await _patientService.GetAppointmentHistoryAsync(patientId.Value);
            var basicInfo = await _patientService.GetPatientBasicInfoAsync(patientId.Value);

            return new SharedMedicalHistoryResponseDto
            {
                BasicInfo = basicInfo,
                Appointments = history,
            };
        }

        public async Task<AppointmentFullDetailsResponseDto> GetSharedAppointmentDetailsAsync(
            string token,
            Guid appointmentId
        )
        {
            var patientId = ValidateTokenAsync(token);

            if (patientId == null)
                return null;

            var sharedLink = await _context.SharedLinks.FirstOrDefaultAsync(s =>
                s.Token == token && s.IsActive && s.ExpiresAt > DateTime.UtcNow
            );

            if (sharedLink == null)
                return null;

            var belongsToPatient = await _context.Appointments.AnyAsync(a =>
                a.Id == appointmentId
                && (
                    (
                        sharedLink.CareUnregisteredPatientId == null
                        && a.PatientUserId == sharedLink.PatientId
                    )
                    || (
                        sharedLink.CareUnregisteredPatientId != null
                        && a.UnregisteredPatientId == sharedLink.CareUnregisteredPatientId
                    )
                )
            );

            if (!belongsToPatient)
                return null;

            AppointmentHistoryDetailsResponseDto app =
                await _patientService.GetAppointmentHistoryDetailsResponseAsync(appointmentId);
            List<GetAppointmentPrescriptionsResponseDto> Prescriptions =
                await _medicalPrescriptionService.GetAppointmentPrescriptionsAsync(appointmentId);
            List<GetAppointmentReferralsResponseDto> Referrals =
                await _medicalReferralService.GetAppointmentReferralsAsync(appointmentId);
            AppointmentFullDetailsResponseDto response = new AppointmentFullDetailsResponseDto
            {
                AppointmentDetails = app,
                Prescriptions = Prescriptions,
                Refferals = Referrals,
            };

            return response;
        }
    }
}
