using MedSync.DataLayer.DTOs.MedicalRecords;

namespace MedSync.Services.IServices
{
    public interface IMedicalRecordsService
    {
        Task<GetMedicalRecordByAppointmentResponseDto> GetMedicalRecordByAppointmentAsync(Guid appointmentId);
        Task<bool> EditMedicalRecordAsync(EditMedicalRecordRequestDto request);
    }
}
