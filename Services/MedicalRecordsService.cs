using MedSync.DataLayer.DTOs.MedicalRecords;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;


namespace MedSync.Services
{
    public class MedicalRecordsService : IMedicalRecordsService
    {
        private readonly MedSyncContext _context;
        public MedicalRecordsService(MedSyncContext context)
        {
            _context = context;
        }

        public async Task<GetMedicalRecordByAppointmentResponseDto> GetMedicalRecordByAppointmentAsync(Guid appointmentId)
        {
            var result = await _context.Appointments
                .Where(a => a.Id == appointmentId)
                .Select(a => new GetMedicalRecordByAppointmentResponseDto
                {
                    AppointmentId = a.Id,
                    PatientName = a.Patient != null
                        ? $"{a.Patient.User.FirstName} {a.Patient.User.LastName}"
                        : $"{a.UnregisteredPatient.FirstName} {a.UnregisteredPatient.LastName}",
                    Cnp = a.Patient != null
                        ? a.Patient.Cnp
                        : a.UnregisteredPatient.Cnp,
                    DateOfBirth = a.Patient != null
                        ? a.Patient.User.DateOfBirth
                        : null,
                    Age = a.Patient != null
                        ? DateTime.Now.Year - a.Patient.User.DateOfBirth.Value.Year
                        : null,
                    Investigation = a.MedicalRecord != null ? a.MedicalRecord.Investigation : null,
                    InvestigationResult = a.MedicalRecord != null ? a.MedicalRecord.InvestigationResult : null,
                    Recommendations = a.MedicalRecord != null ? a.MedicalRecord.Recommendations : null,
                    Symptoms = a.MedicalRecord != null ? a.MedicalRecord.Symptoms : null,
                    Diagnosis = a.MedicalRecord != null ? a.MedicalRecord.Diagnosis : null,
                    AppointmentStatus = a.Status,
                })
                .FirstOrDefaultAsync();

            return result;

        }

        public async Task<bool> EditMedicalRecordAsync(EditMedicalRecordRequestDto request)
        {
            var medicalRecord = await _context.MedicalRecords
                .Where(a => a.AppointmentId == request.AppointmentId)
                .FirstOrDefaultAsync();
            var appointment = await _context.Appointments
                .Where(a => a.Id == request.AppointmentId)
                .FirstOrDefaultAsync();
            if (appointment == null)
                return false;

            if(medicalRecord == null)
            {
                medicalRecord = new MedicalRecord
                {
                    Id = Guid.NewGuid(),
                    AppointmentId = request.AppointmentId,
                    Investigation = request.Investigation,
                    InvestigationResult = request.InvestigationResult,
                    Recommendations = request.Recommendations,
                    Symptoms = request.Symptoms,
                    Diagnosis = request.Diagnosis,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                  
                };
                _context.MedicalRecords.Add(medicalRecord);
            }
            else
            {
                medicalRecord.Investigation =  request.Investigation;
                medicalRecord.InvestigationResult = request.InvestigationResult;
                medicalRecord.Recommendations = request.Recommendations;
                medicalRecord.Symptoms = request.Symptoms;
                medicalRecord.Diagnosis = request.Diagnosis;
                medicalRecord.UpdatedAt = DateTime.UtcNow;
                _context.MedicalRecords.Update(medicalRecord);
            }
            appointment.Status = request.AppointmentStatus;
            _context.Appointments.Update(appointment);
            var res = await _context.SaveChangesAsync();
            return res > 0;
        }

    }
}
