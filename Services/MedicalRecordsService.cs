using MedSync.DataLayer.DTOs.MedicalRecords;
using MedSync.DataLayer.DTOs.Pdf;
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
                .Include(a => a.MedicalRecord)
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

        public async Task<MedicalReportPdfDto> GetMedicalReportPdfDataAsync(Guid medicalRecordId)
        {
           
            var medicalRecordData = await _context.MedicalRecords
                .Include(m => m.Appointment)
                    .ThenInclude(m => m.Institution)
                .Include(m => m.Appointment)
                    .ThenInclude(a => a.Patient)
                        .ThenInclude(p => p.User)
                .Include(m => m.Appointment)
                    .ThenInclude(a => a.UnregisteredPatient)
                 .Include(m => m.Appointment)
                    .ThenInclude(a => a.Doctor)
                        .ThenInclude(p => p.User)
                .Where(m => m.Id == medicalRecordId)
            
                .FirstOrDefaultAsync();

            if(medicalRecordData != null)
            {
                var response = new MedicalReportPdfDto
                {
                    InstitutionName = medicalRecordData.Appointment.Institution.Name,
                    ConsultationDate = medicalRecordData.Appointment.StartDateTime,
                    PatientFullName = medicalRecordData.Appointment.Patient != null
                        ? $"{medicalRecordData.Appointment.Patient.User.FirstName} {medicalRecordData.Appointment.Patient.User.LastName}"
                        : $"{medicalRecordData.Appointment.UnregisteredPatient.FirstName} {medicalRecordData.Appointment.UnregisteredPatient.LastName}",
                    PatientDateOfBirth = medicalRecordData.Appointment.Patient != null
                        ? medicalRecordData.Appointment.Patient.User.DateOfBirth.Value
                        : null,
                    PatientCnp = medicalRecordData.Appointment.Patient != null
                        ? medicalRecordData.Appointment.Patient.Cnp
                        : medicalRecordData.Appointment.UnregisteredPatient.Cnp,
                    Symptoms = medicalRecordData.Symptoms,
                    Investigation = medicalRecordData.Investigation,
                    InvestigationResult = medicalRecordData.InvestigationResult,
                    Diagnosis = medicalRecordData.Diagnosis,
                    Recommendations = medicalRecordData.Recommendations,
                    DoctorFullName = $"{medicalRecordData.Appointment.Doctor.User.FirstName} {medicalRecordData.Appointment.Doctor.User.LastName}",
                    GeneratedAt = DateTime.Now,
                };

                var logoPath = Path.Combine(
                      Directory.GetCurrentDirectory(),
                      "Assets",
                      "logos",
                      "logo.png"
                  );

                if (File.Exists(logoPath))
                {
                    response.InstitutionLogo = File.ReadAllBytes(logoPath);
                }
                return response;
            }
            return null;
        }

    }
}
