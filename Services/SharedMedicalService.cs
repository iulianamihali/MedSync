using MedSync.DataLayer.DTOs.Patient;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace MedSync.Services
{
    public class SharedMedicalService
    {
        private readonly MedSyncContext _context;
        private readonly IConfiguration _configuration;
        private readonly IPatientService _patientService;
        public SharedMedicalService(MedSyncContext context, IConfiguration configuration, IPatientService patientService) 
        {
            _context = context;
            _configuration = configuration;
            _patientService = patientService;
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

        public async Task<SharedMedicalHistoryResponseDto> GetSharedMedicalHistoryAsync(string token)
        {
            var patientId = ValidateTokenAsync(token);

            if (patientId == null)
                return null;

            var sharedLink = await _context.SharedLinks
                .FirstOrDefaultAsync(s => s.Token == token
                    && s.IsActive
                    && s.ExpiresAt > DateTime.UtcNow);

            if (sharedLink == null)
                return null;

            var history = await _patientService.GetAppointmentHistoryAsync(patientId.Value);
            var basicInfo = await _patientService.GetPatientBasicInfoAsync(patientId.Value);

            return new SharedMedicalHistoryResponseDto
            {
                BasicInfo = basicInfo,
                Appointments = history
            };
        }

        public async Task<AppointmentHistoryDetailsResponseDto?> GetSharedAppointmentDetailsAsync(string token, Guid appointmentId)
        {
            var patientId = ValidateTokenAsync(token);

            if (patientId == null)
                return null;

            var sharedLink = await _context.SharedLinks
                .FirstOrDefaultAsync(s => s.Token == token
                    && s.IsActive
                    && s.ExpiresAt > DateTime.UtcNow);

            if (sharedLink == null)
                return null;

            var belongsToPatient = await _context.Appointments
                .AnyAsync(a => a.Id == appointmentId && a.PatientUserId == patientId.Value);

            if (!belongsToPatient)
                return null;

            return await _patientService.GetAppointmentHistoryDetailsResponseAsync(appointmentId);
        }
    }
}
