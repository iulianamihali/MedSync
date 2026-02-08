using MedSync.DataLayer.DTOs.MedicalRecords;
using MedSync.DataLayer.DTOs.Pdf;

namespace MedSync.Services.IServices
{
    public interface IMedicalRecordsService
    {
        Task<GetMedicalRecordByAppointmentResponseDto> GetMedicalRecordByAppointmentAsync(Guid appointmentId);
        Task<bool> EditMedicalRecordAsync(EditMedicalRecordRequestDto request);
        Task<MedicalReportPdfDto> GetMedicalReportPdfDataAsync(Guid medicalRecordId);
    }
}
