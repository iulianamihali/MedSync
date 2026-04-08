using Google.GenAI;
using Google.GenAI.Types;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.Services.AI;
using MedSync.Services.Handlers;
using MedSync.Services.IServices;

namespace MedSync.Services.Handlers.Patient
{
    public class GetDoctorSummaryHandler : IFunctionCallHandler
    {
        private readonly IInstitutionService _institutionService;
        private readonly Client _geminiClient;

        public GetDoctorSummaryHandler(IInstitutionService institutionService, Client geminiClient)
        {
            _institutionService = institutionService;
            _geminiClient = geminiClient;
        }

        public string FunctionName => "get_doctor_summary";

        public async Task<AskResponseDto> HandleAsync(AskRequestDto request, Dictionary<string, object> args)
        {
            var doctorNameArg = args.ContainsKey("doctorName") ? args["doctorName"]?.ToString() : null;
            if (string.IsNullOrWhiteSpace(doctorNameArg))
            {
                return new AskResponseDto { Message = "Please tell me the doctor's name." };
            }

            var institutionArg = args.ContainsKey("institutionName") ? args["institutionName"]?.ToString() : null;

            var candidates = await _institutionService.GetPatientDoctorCandidatesAsync(
                doctorNameArg,
                institutionArg,
                request.UserCoordinates?.Latitude,
                request.UserCoordinates?.Longitude
            );

            if (candidates.Count == 0)
            {
                return new AskResponseDto
                {
                    Message = "I couldn't find that doctor. Please try the full name or add the clinic name."
                };
            }

            if (candidates.Count > 1)
            {
                return new AskResponseDto
                {
                    Message = "I found multiple doctors with that name. Please specify the clinic so I can give the exact profile."
                };
            }

            var doctor = candidates[0];
            var summaryResponse = await _geminiClient.Models.GenerateContentAsync(
                model: GeminiModelConfig.Default,
                contents: $@"User said: '{request.Message}'.
Doctor data:
- Name: {doctor.DoctorName}
- Clinic: {doctor.InstitutionName}
- Years of experience: {doctor.YearsOfExperience}
- Rating: {doctor.Rating}
- Reviews: {doctor.TotalReviews}
- Specialties: {string.Join(", ", doctor.Specialties)}
Write a short doctor summary in 1-2 sentences.
Respond in the same language as the user.",
                config: new GenerateContentConfig
                {
                    SystemInstruction = new Content
                    {
                        Parts =
                        [
                            new Part
                            {
                                Text = "You are an empathetic medical assistant. Be concise and practical."
                            },
                        ],
                    },
                }
            );

            return new AskResponseDto
            {
                Message = summaryResponse.Candidates[0].Content.Parts[0].Text,
            };
        }
    }
}
