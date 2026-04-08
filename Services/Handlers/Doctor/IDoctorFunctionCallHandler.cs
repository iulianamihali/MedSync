using MedSync.DataLayer.DTOs.Gemini;

namespace MedSync.Services.Handlers.Doctor
{
    public interface IDoctorFunctionCallHandler
    {
        string FunctionName { get; }
        Task<DoctorAskResponseDto> HandleAsync(DoctorAskRequestDto request, Dictionary<string, object> args);
    }
}
