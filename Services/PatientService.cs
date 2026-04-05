using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.MedicalPrescriptions;
using MedSync.DataLayer.DTOs.MedicalRecords;
using MedSync.DataLayer.DTOs.Patient;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class PatientService : IPatientService
    {
        private readonly MedSyncContext _context;
        private readonly IConfiguration _configuration;

        public PatientService(MedSyncContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<PatientDetailsResponseDto> GetPatientDetailsAsync(Guid patientId)
        {
            var patient = await _context
                .Patients.Include(p => p.User)
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
                    Address =
                        patient.User.Address.Country
                        + ", "
                        + patient.User.Address.City
                        + ", "
                        + patient.User.Address.Street
                        + ", "
                        + patient.User.Address.Number,

                    PhoneNumber = patient.User.PhoneNumber,
                    Email = patient.User.Email,
                };
                return result;
            }
            else
            {
                var unregistredPatient = await _context.UnregisteredPatients.FirstOrDefaultAsync(
                    p => p.Id == patientId
                );
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
                        Email = unregistredPatient.Email,
                    };
                    return result;
                }
            }
            return null;
        }

        public async Task<
            List<PatientAppointmentsSummaryResponseDto>
        > GetPatientAppointmentsSummariesAsync(Guid institutionId, Guid doctorId, Guid patientId)
        {
            var appointments = await _context
                .Appointments.Where(a =>
                    a.InstitutionId == institutionId
                    && a.DoctorUserId == doctorId
                    && (a.PatientUserId == patientId || a.UnregisteredPatientId == patientId)
                )
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

        public async Task<List<GetFutureAppointmentsResponseDto>> GetFutureAppointmentsAsync(
            Guid patientId
        )
        {
            var result = await _context
                .Appointments.Where(a =>
                    (a.PatientUserId == patientId || a.UnregisteredPatientId == patientId)
                    && a.StartDateTime > DateTime.UtcNow
                )
                .Select(x => new GetFutureAppointmentsResponseDto
                {
                    AppointmentId = x.Id,
                    StatusAppointment = x.Status,
                    SpecialtyName = x.InstitutionService.Specialty.Name,
                    StartDateTimeUtc = x.StartDateTime,
                    EndDateTimeUtc = x.EndDateTime,
                    InstitutionName = x.Institution.Name,
                    Address =
                        x.Institution.Address.City
                        + ", "
                        + x.Institution.Address.Street
                        + ", "
                        + x.Institution.Address.Number,
                    DoctorName = x.Doctor.User.FirstName + " " + x.Doctor.User.LastName,
                })
                .OrderBy(x => x.StartDateTimeUtc)
                .ToListAsync();
            return result;
        }

        public async Task<List<ActiveMedicationResponseDto>> GetActiveMedicationsAsync(
            Guid patientId
        )
        {
            var prescriptions = await _context
                .Prescriptions.Where(p => p.Appointment.PatientUserId == patientId)
                .Select(p => new
                {
                    p.Id,
                    p.Diagnosis,
                    StartDate = p.Appointment.StartDateTime,
                    DoctorName = p.Appointment.Doctor.User.FirstName
                        + " "
                        + p.Appointment.Doctor.User.LastName,
                    Medications = p
                        .Medications.Select(m => new
                        {
                            m.Name,
                            m.Strength,
                            m.Dosage,
                            m.Frequency,
                            m.Duration,
                        })
                        .ToList(),
                })
                .ToListAsync();

            var today = DateTime.Now;

            var response = prescriptions
                .Where(p =>
                    p.Medications.Any(m => p.StartDate.AddDays(int.Parse(m.Duration)) >= today)
                )
                .Select(p => new ActiveMedicationResponseDto
                {
                    PrescriptionId = p.Id,
                    Diagnosis = p.Diagnosis,
                    PrescribedAt = p.StartDate,
                    DoctorName = p.DoctorName,
                    MedicationItems = p
                        .Medications.Select(m => new MedicationItemDto
                        {
                            MedicationName = m.Name,
                            Strength = m.Strength,
                            Dosage = m.Dosage,
                            Frequency = m.Frequency,
                            Duration = m.Duration,
                        })
                        .ToList(),
                })
                .ToList();

            return response;
        }

        public async Task<List<AppointmentHistoryResponseDto>> GetAppointmentHistoryAsync(
            Guid patientId
        )
        {
            var result = await _context
                .Appointments.Where(a =>
                    (a.PatientUserId == patientId || a.UnregisteredPatientId == patientId)
                    && a.StartDateTime < DateTime.UtcNow
                )
                .Select(a => new AppointmentHistoryResponseDto
                {
                    AppointmentId = a.Id,
                    DoctorName = a.Doctor.User.FirstName + " " + a.Doctor.User.LastName,
                    Address =
                        a.Institution.Address.City
                        + ", "
                        + a.Institution.Address.Street
                        + ", "
                        + a.Institution.Address.Number,
                    Specialty = a.InstitutionService.Specialty.Name,
                    StartDateTime = a.StartDateTime,
                    Service = a.InstitutionService.Service.Name,
                })
                .OrderByDescending(a => a.StartDateTime)
                .ToListAsync();
            return result;
        }

        public async Task<AppointmentHistoryDetailsResponseDto> GetAppointmentHistoryDetailsResponseAsync(
            Guid appointmentId
        )
        {
            var response = await _context
                .Appointments.Where(a => a.Id == appointmentId)
                .Select(x => new AppointmentHistoryDetailsResponseDto
                {
                    MedicalRecordId =
                        x.MedicalRecord != null ? x.MedicalRecord.Id.ToString() : null,
                    DoctorName = x.Doctor.User.FirstName + " " + x.Doctor.User.LastName,
                    SpecialtyName = x.InstitutionService.Specialty.Name,
                    ServiceName = x.InstitutionService.Service.Name,
                    DateTime = x.StartDateTime,
                    Address =
                        x.Institution.Address.City
                        + ", "
                        + x.Institution.Address.Street
                        + ", "
                        + x.Institution.Address.Number,
                    DataMedicalRecord = new EditMedicalRecordRequestDto
                    {
                        AppointmentId = x.Id,
                        Investigation = x.MedicalRecord.Investigation,
                        InvestigationResult = x.MedicalRecord.InvestigationResult,
                        Recommendations = x.MedicalRecord.Recommendations,
                        Symptoms = x.MedicalRecord.Symptoms,
                        Diagnosis = x.MedicalRecord.Diagnosis,
                        AppointmentStatus = x.Status,
                    },
                })
                .FirstOrDefaultAsync();
            var hasRefferals = await _context
                .MedicalReferrals.Where(m => m.AppointmentId == appointmentId)
                .AnyAsync();
            var hasPrescriptions = await _context
                .Prescriptions.Where(p => p.AppointmentId == appointmentId)
                .AnyAsync();
            response.HasMedicalRefferals = hasRefferals;
            response.HasMedicalPrescriptions = hasPrescriptions;
            return response;
        }

        public async Task<string> GenerateSharedLinkAsync(GenerateLinkRequestDto request)
        {
            var secretKey = _configuration["SharedLinks:SecretKey"];
            var keyBytes = Convert.FromBase64String(secretKey);

            var message =
                $"{request.CareUnregisteredPatientId ?? request.PatientId}:{DateTime.UtcNow:o}";
            var messageBytes = Encoding.UTF8.GetBytes(message);

            using var hmac = new HMACSHA256(keyBytes);
            var signatureBytes = hmac.ComputeHash(messageBytes);
            var signature = Convert.ToBase64String(signatureBytes);
            var token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{message}:{signature}"));

            var sharedLink = new SharedLink
            {
                Id = Guid.NewGuid(),
                PatientId = request.PatientId,
                CareUnregisteredPatientId = request.CareUnregisteredPatientId ?? null,
                Token = token,
                IsActive = true,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                CreatedAt = DateTime.UtcNow,
            };

            _context.SharedLinks.Add(sharedLink);
            await _context.SaveChangesAsync();

            return token;
        }

        public async Task<ActiveLinkStatusResponseDto> GetActiveLinkStatusAsync(
            GenerateLinkRequestDto request
        )
        {
            var response = await _context
                .SharedLinks
                //.Where(s => ((request.CareUnregisteredPatientId == null && s.PatientId == request.PatientId) || (request.CareUnregisteredPatientId != null && s.CareUnregisteredPatientId == request.CareUnregisteredPatientId)) && s.IsActive == true && s.ExpiresAt > DateTime.UtcNow)
                .Where(s =>
                    s.PatientId == request.PatientId
                    && s.CareUnregisteredPatientId == request.CareUnregisteredPatientId
                    && s.IsActive == true
                    && s.ExpiresAt > DateTime.UtcNow
                )
                .Select(s => new ActiveLinkStatusResponseDto
                {
                    Token = s.Token,
                    RemainingSeconds = (int)(s.ExpiresAt - DateTime.UtcNow).TotalSeconds,
                })
                .FirstOrDefaultAsync();
            return response;
        }

        public async Task<bool> RevokeSharedLinkAsync(GenerateLinkRequestDto request)
        {
            var activeLinks = await _context
                .SharedLinks.Where(s =>
                    s.PatientId == request.PatientId
                    && s.CareUnregisteredPatientId == request.CareUnregisteredPatientId
                    && s.IsActive == true
                )
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
            var patient = await _context
                .Patients.Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == patientId);

            if (patient != null)
                return new PatientBasicInfoResponseDto
                {
                    Id = patient.UserId,
                    FullName = patient.User.FirstName + " " + patient.User.LastName,
                    DateOfBirth = patient.User.DateOfBirth ?? null,
                };

            var unregistered = await _context.UnregisteredPatients.FirstOrDefaultAsync(p =>
                p.Id == patientId
            );

            if (unregistered != null)
                return new PatientBasicInfoResponseDto
                {
                    Id = unregistered.Id,
                    FullName = unregistered.FirstName + " " + unregistered.LastName,
                    DateOfBirth = unregistered.DateOfBirth,
                };

            return null;
        }

        public async Task<PatientAIContextDto> GetAIContextAsync(Guid userId)
        {
            var user = await _context
                .Users.Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.FirstName,
                    u.Gender,
                    u.DateOfBirth,
                })
                .FirstOrDefaultAsync();

            var appointments = await _context
                .Appointments.Where(a => a.PatientUserId == userId)
                .Include(a => a.MedicalRecord)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                .Include(a => a.Institution)
                .Include(a => a.InstitutionService)
                    .ThenInclude(s => s.Service)
                .Include(a => a.InstitutionService)
                    .ThenInclude(s => s.Specialty)
                .Include(a => a.Prescriptions)
                    .ThenInclude(p => p.Medications)
                .Include(a => a.MedicalReferrals)
                .ToListAsync();

            var paidAppointments = appointments
                .Where(a =>
                    a.StartDateTime <= DateTime.UtcNow
                    && a.Status != AppointmentStatusEnumType.Canceled
                    && a.InstitutionService != null
                    && a.InstitutionService.Price > 0
                )
                .OrderByDescending(a => a.StartDateTime)
                .ToList();

            var lastAppointment = appointments
                .Where(a =>
                    a.StartDateTime <= DateTime.UtcNow
                    && a.Status != AppointmentStatusEnumType.Canceled
                )
                .OrderByDescending(a => a.StartDateTime)
                .FirstOrDefault();

            var lastAppointmentSummary = lastAppointment == null
                ? "none"
                : $"{lastAppointment.StartDateTime:yyyy-MM-dd HH:mm} | {lastAppointment.Institution?.Name ?? "Unknown clinic"} | Dr. {lastAppointment.Doctor?.User?.FirstName} {lastAppointment.Doctor?.User?.LastName} | {lastAppointment.InstitutionService?.Specialty?.Name ?? "Unknown specialty"}";

            var totalSpentOnAppointments = paidAppointments.Sum(a => a.InstitutionService.Price);
            var appointmentSpendingDetails = paidAppointments
                .Take(10)
                .Select(a =>
                    $"[{a.StartDateTime:yyyy-MM-dd}] {a.Institution?.Name ?? "Unknown clinic"} | {a.InstitutionService?.Specialty?.Name ?? "Specialty"} | {a.InstitutionService?.Service?.Name ?? "Service"} | {a.InstitutionService?.Price:0.##}"
                )
                .ToList();

            var diagnoses = appointments
                .Where(a => a.MedicalRecord != null && a.MedicalRecord.Diagnosis != null)
                .Select(a => a.MedicalRecord.Diagnosis)
                .Distinct()
                .ToList();

            var symptoms = appointments
                .Where(a => a.MedicalRecord != null && a.MedicalRecord.Symptoms != null)
                .Select(a => a.MedicalRecord.Symptoms)
                .Distinct()
                .ToList();

            var recommendations = appointments
                .Where(a => a.MedicalRecord != null && a.MedicalRecord.Recommendations != null)
                .Select(a => a.MedicalRecord.Recommendations)
                .Distinct()
                .ToList();
            var medications = appointments
                .SelectMany(a =>
                    a.Prescriptions.Select(p => new
                    {
                        p,
                        a.CreatedAt,
                        a.Doctor,
                        a.Institution,
                    })
                )
                .SelectMany(x =>
                    x.p.Medications.Select(m => new
                    {
                        m,
                        x.CreatedAt,
                        x.Doctor,
                        x.Institution,
                    })
                )
                .Select(x =>
                    $"{x.m.Name} {x.m.Strength} - {x.m.Dosage}, {x.m.Frequency}, duration: {x.m.Duration}, prescribed on: {x.CreatedAt:yyyy-MM-dd}"
                    + (
                        x.Doctor?.User != null
                            ? $", by: Dr. {x.Doctor.User.FirstName} {x.Doctor.User.LastName}"
                            : ""
                    )
                    + (x.Institution != null ? $", at: {x.Institution.Name}" : "")
                )
                .Distinct()
                .ToList();

            var referrals = appointments
                .SelectMany(a => a.MedicalReferrals)
                .Select(r => r.SuspectedDiagnosis)
                .Distinct()
                .ToList();
            var doctors = appointments
                .Where(a => a.Doctor?.User != null)
                .Select(a =>
                    $"Dr. {a.Doctor.User.FirstName} {a.Doctor.User.LastName} - {a.InstitutionService?.Specialty?.Name}"
                )
                .Distinct()
                .ToList();

            return new PatientAIContextDto
            {
                PatientName = user.FirstName,
                Gender = user.Gender,
                Age = DateTime.Today.Year - user.DateOfBirth.Value.Year,
                LastAppointmentSummary = lastAppointmentSummary,
                TotalSpentOnAppointments = totalSpentOnAppointments,
                AppointmentSpendingDetails = appointmentSpendingDetails,
                Diagnoses = diagnoses,
                Symptoms = symptoms,
                Recommendations = recommendations,
                Medications = medications,
                Referrals = referrals,
                Doctors = doctors,
            };
        }
    }
}
