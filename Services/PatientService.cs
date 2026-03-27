using MedSync.DataLayer.DTOs.MedicalPrescriptions;
using MedSync.DataLayer.DTOs.MedicalRecords;
using MedSync.DataLayer.DTOs.Patient;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace MedSync.Services
{
    public class PatientService : IPatientService
    {
        private readonly MedSyncContext _context;
        private readonly IConfiguration _configuration;
        public PatientService(MedSyncContext context, IConfiguration configuration) {
            _context = context;
            _configuration = configuration;
        }
        public async Task<PatientDetailsResponseDto> GetPatientDetailsAsync(Guid patientId)
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                    .ThenInclude(p => p.Address)
                .FirstOrDefaultAsync(p => p.UserId == patientId);
            if (patient != null)
            {
                var result = new PatientDetailsResponseDto
                {
                    Id = patient.UserId,
                    FirstName = patient.User.FirstName,
                    LastName = patient.User.LastName,
                    DateOfBirth = patient.User.DateOfBirth,
                    Address = patient.User.Address.Country + ", " +
                      patient.User.Address.City + ", " +
                      patient.User.Address.Street + ", " +
                      patient.User.Address.Number,

                    PhoneNumber = patient.User.PhoneNumber,
                    Email = patient.User.Email
                };
                return result;
            }
            else
            {
                var unregistredPatient = await _context.UnregisteredPatients
                    .FirstOrDefaultAsync(p => p.Id == patientId);
                if (unregistredPatient != null)
                {
                    var result = new PatientDetailsResponseDto
                    {
                        Id = unregistredPatient.Id,
                        FirstName = unregistredPatient.FirstName,
                        LastName = unregistredPatient.LastName,
                        DateOfBirth = null,
                        Address = null,
                        PhoneNumber = unregistredPatient.PhoneNumber,
                        Email = unregistredPatient.Email
                    };
                    return result;
                }

            }
            return null;
        }

        public async Task<List<PatientAppointmentsSummaryResponseDto>> GetPatientAppointmentsSummariesAsync(Guid institutionId, Guid doctorId, Guid patientId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.InstitutionId == institutionId && a.DoctorUserId == doctorId && (a.PatientUserId == patientId || a.UnregisteredPatientId == patientId))
                .Select(a => new PatientAppointmentsSummaryResponseDto
                {
                    MedicalRecordId = a.MedicalRecord.Id,
                    AppointmentId = a.Id,
                    Date = a.StartDateTime,
                    Status = a.Status,
                    Service = a.InstitutionService.Service.Name,
                    Diagnosis = a.MedicalRecord.Diagnosis,
                })
                .OrderByDescending(a => a.Date)
                .ToListAsync();
            return appointments;
        }

        public async Task<List<GetFutureAppointmentsResponseDto>> GetFutureAppointmentsAsync(Guid patientId)
        {
            var result = await _context.Appointments
                .Where(a => a.PatientUserId == patientId && a.StartDateTime > DateTime.UtcNow)
                .Select(x => new GetFutureAppointmentsResponseDto
                {
                    AppointmentId = x.Id,
                    StatusAppointment = x.Status,
                    SpecialtyName = x.InstitutionService.Specialty.Name,
                    StartDateTimeUtc = x.StartDateTime,
                    EndDateTimeUtc = x.EndDateTime,
                    InstitutionName = x.Institution.Name,
                    Address =
                      x.Institution.Address.City + ", " +
                      x.Institution.Address.Street + ", " +
                      x.Institution.Address.Number,
                    DoctorName = x.Doctor.User.FirstName + " " + x.Doctor.User.LastName
                })
                .OrderBy(x => x.StartDateTimeUtc)
                .ToListAsync();
            return result;
        }

        public async Task<List<ActiveMedicationResponseDto>> GetActiveMedicationsAsync(Guid patientId)
        {
            var prescriptions = await _context.Prescriptions
                .Where(p => p.Appointment.PatientUserId == patientId)
                .Select(p => new
                {
                    p.Id,
                    p.Diagnosis,
                    StartDate = p.Appointment.StartDateTime,
                    DoctorName = p.Appointment.Doctor.User.FirstName + " " + p.Appointment.Doctor.User.LastName,
                    Medications = p.Medications.Select(m => new
                    {
                        m.Name,
                        m.Strength,
                        m.Dosage,
                        m.Frequency,
                        m.Duration
                    }).ToList()
                })
                .ToListAsync();

            var today = DateTime.Now;

            var response = prescriptions
                .Where(p => p.Medications.Any(m =>
                    p.StartDate.AddDays(int.Parse(m.Duration)) >= today))
                .Select(p => new ActiveMedicationResponseDto
                {
                    PrescriptionId = p.Id,
                    Diagnosis = p.Diagnosis,
                    PrescribedAt = p.StartDate,
                    DoctorName = p.DoctorName,
                    MedicationItems = p.Medications.Select(m => new MedicationItemDto
                    {
                        MedicationName = m.Name,
                        Strength = m.Strength,
                        Dosage = m.Dosage,
                        Frequency = m.Frequency,
                        Duration = m.Duration,
                    }).ToList()
                })
                .ToList();

            return response;

        }

        public async Task<List<AppointmentHistoryResponseDto>> GetAppointmentHistoryAsync(Guid patientId)
        {
            var result = await _context.Appointments
                .Where(a => a.PatientUserId == patientId && a.StartDateTime < DateTime.UtcNow)
                .Select(a => new AppointmentHistoryResponseDto
                {
                    AppointmentId = a.Id,
                    DoctorName = a.Doctor.User.FirstName + " " + a.Doctor.User.LastName,
                    Address = a.Institution.Address.City + ", " +
                      a.Institution.Address.Street + ", " +
                      a.Institution.Address.Number,
                    Specialty = a.InstitutionService.Specialty.Name,
                    StartDateTime = a.StartDateTime,
                    Service = a.InstitutionService.Service.Name

                })
                .OrderByDescending(a => a.StartDateTime)
                .ToListAsync();
            return result;
        }


        public async Task<AppointmentHistoryDetailsResponseDto> GetAppointmentHistoryDetailsResponseAsync(Guid appointmentId)
        {
            var response = await _context.Appointments
                .Where(a => a.Id == appointmentId)  
                .Select(x => new AppointmentHistoryDetailsResponseDto
                {
                    MedicalRecordId = x.MedicalRecord != null ? x.MedicalRecord.Id.ToString() : null,
                    DoctorName = x.Doctor.User.FirstName + " " + x.Doctor.User.LastName,
                    SpecialtyName = x.InstitutionService.Specialty.Name,
                    ServiceName = x.InstitutionService.Service.Name,
                    DateTime = x.StartDateTime,
                    Address = x.Institution.Address.City + ", " +
                        x.Institution.Address.Street + ", " +
                        x.Institution.Address.Number,
                   DataMedicalRecord = new EditMedicalRecordRequestDto
                   {
                       AppointmentId = x.Id,
                       Investigation = x.MedicalRecord.Investigation,
                       InvestigationResult = x.MedicalRecord.InvestigationResult,
                       Recommendations = x.MedicalRecord.Recommendations,
                       Symptoms = x.MedicalRecord.Symptoms,
                       Diagnosis = x.MedicalRecord.Diagnosis,
                       AppointmentStatus = x.Status,
                   }

                }) 
                .FirstOrDefaultAsync();
            var hasRefferals = await _context.MedicalReferrals
                .Where(m => m.AppointmentId == appointmentId)
                .AnyAsync();
            var hasPrescriptions = await _context.Prescriptions
                .Where(p => p.AppointmentId == appointmentId)
                .AnyAsync();
            response.HasMedicalRefferals = hasRefferals;
            response.HasMedicalPrescriptions = hasPrescriptions;
            return response;
        }

        public async Task<string> GenerateSharedLinkAsync(Guid patientId)
        {
            var secretKey = _configuration["SharedLinks:SecretKey"];
            var keyBytes = Convert.FromBase64String(secretKey);

            var message = $"{patientId}:{DateTime.UtcNow:o}";
            var messageBytes = Encoding.UTF8.GetBytes(message);

            using var hmac = new HMACSHA256(keyBytes);
            var signatureBytes = hmac.ComputeHash(messageBytes);
            var signature = Convert.ToBase64String(signatureBytes);
            var token = Convert.ToBase64String(
                    Encoding.UTF8.GetBytes($"{message}:{signature}")
                );

            var sharedLink = new SharedLink
            {
                Id = Guid.NewGuid(),
                PatientId = patientId,
                Token = token,
                IsActive = true,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                CreatedAt = DateTime.UtcNow
            };

            _context.SharedLinks.Add(sharedLink);
            await _context.SaveChangesAsync();

            return token;
        }

        public async Task<ActiveLinkStatusResponseDto> GetLinkStatusAsync(Guid patientId)
        {
            var response = await _context.SharedLinks
                .Where(s => s.PatientId == patientId && s.IsActive == true && s.ExpiresAt > DateTime.UtcNow)
                .Select(s => new ActiveLinkStatusResponseDto
                {
                    Token = s.Token,
                    RemainingSeconds = (int)(s.ExpiresAt - DateTime.UtcNow).TotalSeconds,
                })
                .FirstOrDefaultAsync();
            return response;
        }

        public async Task<bool> RevokeSharedLinkAsync(Guid patientId)
        {
            var activeLinks = await _context.SharedLinks
                .Where(s => s.PatientId == patientId && s.IsActive)
                .ToListAsync();

            if (activeLinks.Any())
            {
                foreach (var link in activeLinks)
                    link.IsActive = false;

                return await _context.SaveChangesAsync() > 0;
            }

            return false;
        }



        public async Task<PatientBasicInfoResponseDto> GetPatientBasicInfoAsync(Guid patientId)
        {
            var response = await _context.Patients
                .Where(p => p.UserId == patientId)
                .Select(p => new PatientBasicInfoResponseDto
                {
                    Id = p.UserId,
                    FullName = p.User.FirstName + " " + p.User.LastName,
                    DateOfBirth = p.User.DateOfBirth
                })
                .FirstOrDefaultAsync();
            return response;
        }




    }
}
