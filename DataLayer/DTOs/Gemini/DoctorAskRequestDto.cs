namespace MedSync.DataLayer.DTOs.Gemini
{
    public class DoctorAskRequestDto
    {
        public Guid DoctorId { get; set; }
        public Guid InstitutionId { get; set; }
        public string Message { get; set; }
        public List<ChatMessageDto>? ConversationHistory { get; set; }
    }
}
