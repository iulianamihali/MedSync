using MedSync.DataLayer.DTOs.Patient;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace MedSync.Services
{
    public class PatientService : IPatientService
    {
        private readonly MedSyncContext _context;
        public PatientService(MedSyncContext context) {
            _context = context;
        }
        public async Task<PatientDetailsResponseDto> GetPatientDetailsAsync(Guid patientId)
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                    .ThenInclude(p => p.Address)
                .FirstOrDefaultAsync(p => p.UserId == patientId);
            if(patient != null)
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
                if(unregistredPatient != null)
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


    }
}
