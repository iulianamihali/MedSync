using MedSync.DataLayer.DTOs.User;

namespace MedSync.DataLayer.DTOs.Gemini
{
    public class AskRequestDto
    {
        public Guid PatientId { get; set; }
        public string Message { get; set; }
        public UserCoordinatesDto? UserCoordinates { get; set; }
        public List<ChatMessageDto>? ConversationHistory { get; set; }
    }
}
