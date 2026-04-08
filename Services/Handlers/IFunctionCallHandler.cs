using MedSync.DataLayer.DTOs.Gemini;

namespace MedSync.Services.Handlers
{
    public interface IFunctionCallHandler
    {
        string FunctionName { get; }
        Task<AskResponseDto> HandleAsync(AskRequestDto request, Dictionary<string, object> args);
    }
}
