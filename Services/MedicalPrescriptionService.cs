using MedSync.DataLayer.DTOs.MedicalPrescriptions;
using MedSync.DataLayer.DTOs.Pdf;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class MedicalPrescriptionService : IMedicalPrescriptionService
    {
        private readonly MedSyncContext _context;

        public MedicalPrescriptionService(MedSyncContext context)
        {
            _context = context;
        }

        public async Task<Guid> AddMedicalPrescriptionAsync(AddMedicalPrescriptionRequestDto request)
        {

            var medicalPrescription = new Prescription
            {
                Id = Guid.NewGuid(),
                AppointmentId = request.AppointmentId,
                Diagnosis = request.Diagnosis
            };
            _context.Prescriptions.Add(medicalPrescription);
            for (int i = 0; i < request.Medications.Count; i++)
            {
                var medication = new Medication
                {
                    Id = Guid.NewGuid(),
                    PrescriptionId = medicalPrescription.Id,
                    Name = request.Medications[i].MedicationName,
                    Strength = request.Medications[i].Strength,
                    Dosage = request.Medications[i].Dosage,
                    Frequency = request.Medications[i].Frequency,
                    Duration = request.Medications[i].Duration,
                };
                _context.Medications.Add(medication);
            }
            return await _context.SaveChangesAsync() > 0 ? medicalPrescription.Id : Guid.Empty;
        }

        public async Task<MedicalPrescriptionPdfDto> GetMedicalPrescriptionPdfDataAsync(Guid prescriptionId)
        {
            var medicalPrescription = await _context.Prescriptions
                .Where(p => p.Id == prescriptionId)
                .Select(x => new MedicalPrescriptionPdfDto
                {
                    IssuedAt = x.Appointment.CreatedAt,
                    InstitutionName = x.Appointment.Institution.Name,
                    InstitutionAddress = x.Appointment.Institution.Address != null
                     ? $"{x.Appointment.Institution.Address.Country}, {x.Appointment.Institution.Address.City}, {x.Appointment.Institution.Address.Street}, {x.Appointment.Institution.Address.Number}"
                        : "-",
                    PatientFirstName = x.Appointment.Patient != null ? x.Appointment.Patient.User.FirstName : x.Appointment.UnregisteredPatient.FirstName,
                    PatientLastName = x.Appointment.Patient != null ? x.Appointment.Patient.User.LastName : x.Appointment.UnregisteredPatient.LastName,
                    PatientCnp = x.Appointment.Patient != null ? x.Appointment.Patient.Cnp : x.Appointment.UnregisteredPatient.Cnp,
                    PatientDateOfBirth = x.Appointment.Patient != null ? x.Appointment.Patient.User.DateOfBirth : null,
                    Diagnosis = x.Diagnosis,
                    DoctorFullName = $"{x.Appointment.Doctor.User.FirstName} {x.Appointment.Doctor.User.LastName}",
                    Medications = x.Medications.Select(m => new MedicationItemDto
                    {
                        MedicationName = m.Name,
                        Strength = m.Strength,
                        Frequency = m.Frequency,
                        Duration = m.Duration
                    }).ToList()
                })
                .FirstOrDefaultAsync();
            if(medicalPrescription == null)
            {
                return null;
            }

            var logoPath = Path.Combine(
                  Directory.GetCurrentDirectory(),
                  "Assets",
                  "logos",
                  "logo.png"
              );
            if (File.Exists(logoPath))
            {
                medicalPrescription.InstitutionLogo = File.ReadAllBytes(logoPath);
            }
            return medicalPrescription;
        }

        public async Task<List<GetAppointmentPrescriptionsResponseDto>> GetAppointmentPrescriptionsAsync(Guid appointmentId)
        {
            var prescriptions = await _context.Prescriptions
                .Where(p => p.AppointmentId == appointmentId)
                .Select(x => new GetAppointmentPrescriptionsResponseDto { 
                    PrescriptionId = x.Id,
                    Diagnosis = x.Diagnosis,
                    IssuedAt = DateTime.UtcNow,
                    ExpirationDate = DateTime.UtcNow.AddMonths(1)
                })
                .OrderByDescending(x => x.IssuedAt)
                .ToListAsync();

            return prescriptions;
        }

    }
}
