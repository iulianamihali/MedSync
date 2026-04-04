using MedSync.DataLayer.DTOs.Gemini;
using MedSync.DataLayer.DTOs.User;

namespace MedSync.Services.IServices
{
    public interface IGeminiService
    {
        Task<AskResponseDto> AskAsync(AskRequestDto request);
    }
}
