using MedSync.DataLayer.DTOs.MedicalPrescriptions;
using MedSync.DataLayer.DTOs.Pdf;

namespace MedSync.Services.IServices
{
    public interface IMedicalPrescriptionService
    {
        Task<Guid> AddMedicalPrescriptionAsync(AddMedicalPrescriptionRequestDto request);
        Task<MedicalPrescriptionPdfDto> GetMedicalPrescriptionPdfDataAsync(Guid prescriptionId);
        Task<List<GetAppointmentPrescriptionsResponseDto>> GetAppointmentPrescriptionsAsync(
            Guid appointmentId
        );
    }
}
