using MedSync.DataLayer.DTOs.Institution;

namespace MedSync.DataLayer.DTOs.Gemini
{
    public class AskResponseDto
    {
        public string? Message { get; set; }
        public List<InstitutionDetailsResponse>? Clinics { get; set; }
        public List<AvailableSlotDto>? AvailableSlots { get; set; }
    }
}
