using Google.GenAI;
using Google.GenAI.Types;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.Services.AI;
using MedSync.Services.Handlers;
using MedSync.Services.IServices;
using System.Text.Json;

namespace MedSync.Services.Handlers.Patient
{
    public class SearchClinicsHandler : IFunctionCallHandler
    {
        private readonly IInstitutionService _institutionService;
        private readonly Client _geminiClient;

        public SearchClinicsHandler(IInstitutionService institutionService, Client geminiClient)
        {
            _institutionService = institutionService;
            _geminiClient = geminiClient;
        }

        public string FunctionName => "search_clinics";

        public async Task<AskResponseDto> HandleAsync(AskRequestDto request, Dictionary<string, object> args)
        {
            var specialty = args.ContainsKey("specialty") ? args["specialty"]?.ToString() : null;
            if (string.IsNullOrEmpty(specialty))
                specialty = null;

            var service = args.ContainsKey("service") ? args["service"]?.ToString() : null;
            if (string.IsNullOrEmpty(service))
                service = null;

            var doctorName = args.ContainsKey("doctorName") ? args["doctorName"]?.ToString() : null;
            if (string.IsNullOrEmpty(doctorName))
                doctorName = null;

            var institutionName = args.ContainsKey("institutionName") ? args["institutionName"]?.ToString() : null;
            if (string.IsNullOrEmpty(institutionName))
                institutionName = null;

            var clinics = await _institutionService.GetInstitutionsBySpecialtyAndServiceAsync(
                specialty,
                service,
                request.UserCoordinates?.Latitude,
                request.UserCoordinates?.Longitude,
                doctorName,
                institutionName
            );

            var nearestClinic = clinics
                .OrderBy(c => c.Distance ?? double.MaxValue)
                .FirstOrDefault();
            var bestRatedClinic = clinics
                .OrderByDescending(c => c.Rating)
                .ThenByDescending(c => c.TotalReviews)
                .FirstOrDefault();
            var clinicsForPrompt = JsonSerializer.Serialize(
                clinics.Select(c => new
                {
                    c.InstitutionName,
                    c.Distance,
                    c.Rating,
                    c.TotalReviews,
                })
            );

            var naturalResponse = await _geminiClient.Models.GenerateContentAsync(
                model: GeminiModelConfig.Default,
                contents: $@"User said: '{request.Message}'.
                    {(doctorName != null ? $"They want to book an appointment with doctor: {doctorName}." : $"They need a clinic for specialty: {specialty}.")}
                    You found {clinics.Count} clinic(s).
                    Clinic data: {clinicsForPrompt}
                    Nearest clinic by distance: {(nearestClinic != null ? nearestClinic.InstitutionName : "none")}
                    Best clinic by rating: {(bestRatedClinic != null ? bestRatedClinic.InstitutionName : "none")}
                    Write 1-2 sentences acknowledging their request naturally and presenting the results.
                    If the user asks which one is closest/nearest, answer directly with the nearest clinic.
                    If the user asks which one is best/top, answer directly with the best-rated clinic.
                    Do NOT claim that any appointment was booked/confirmed.
                    If they want to book, direct them to choose a clinic/doctor/slot in the app.
                    Avoid listing all clinic details because cards are shown separately.
                    Do NOT use markdown formatting like ** or *.
                    {(clinics.Count == 0 ? "Apologize and suggest they try a different search." : "")}
                    Respond in the same language as the user.",
                config: new GenerateContentConfig
                {
                    SystemInstruction = new Content
                    {
                        Parts =
                        [
                            new Part
                            {
                                Text = "You are an empathetic medical assistant. Be concise, warm and human.",
                            },
                        ],
                    },
                }
            );

            return new AskResponseDto
            {
                Message = naturalResponse.Candidates[0].Content.Parts[0].Text,
                Clinics = clinics,
            };
        }
    }
}
