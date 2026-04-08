using Google.GenAI;
using Google.GenAI.Types;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.Services.AI;
using MedSync.Services.Handlers;
using MedSync.Services.IServices;
using System.Text.Json;

namespace MedSync.Services.Handlers.Patient
{
    public class RankDoctorsHandler : IFunctionCallHandler
    {
        private readonly IInstitutionService _institutionService;
        private readonly Client _geminiClient;

        public RankDoctorsHandler(IInstitutionService institutionService, Client geminiClient)
        {
            _institutionService = institutionService;
            _geminiClient = geminiClient;
        }

        public string FunctionName => "rank_doctors";

        public async Task<AskResponseDto> HandleAsync(AskRequestDto request, Dictionary<string, object> args)
        {
            var specialtyArg = args.ContainsKey("specialty") ? args["specialty"]?.ToString() : null;
            var institutionArg = args.ContainsKey("institutionName") ? args["institutionName"]?.ToString() : null;
            var top = args.ContainsKey("top") && int.TryParse(args["top"]?.ToString(), out var parsedTop)
                ? Math.Clamp(parsedTop, 1, 10)
                : 3;

            var messageLower = request.Message.ToLowerInvariant();
            var asksClinicByRating =
                messageLower.Contains("clinic")
                || messageLower.Contains("clinica")
                || messageLower.Contains("policlinica")
                || messageLower.Contains("hospital")
                || (messageLower.Contains("rating")
                    && !messageLower.Contains("doctor")
                    && !messageLower.Contains("dr."));

            if (asksClinicByRating)
            {
                var clinicsByRating = await _institutionService.GetInstitutionsBySpecialtyAndServiceAsync(
                    specialtyArg,
                    null,
                    request.UserCoordinates?.Latitude,
                    request.UserCoordinates?.Longitude,
                    null,
                    institutionArg
                );

                var clinicsForDecision = clinicsByRating;
                var hasCoordinates = request.UserCoordinates?.Latitude != null && request.UserCoordinates?.Longitude != null;
                if (hasCoordinates)
                {
                    var nearbyClinics = clinicsByRating
                        .Where(c => c.Distance.HasValue && c.Distance.Value <= 50)
                        .ToList();

                    if (nearbyClinics.Count > 0)
                    {
                        clinicsForDecision = nearbyClinics;
                    }
                }

                var asksBestAfterNearest =
                    (messageLower.Contains("apropi") || messageLower.Contains("near"))
                    && messageLower.Contains("rating");

                if (asksBestAfterNearest)
                {
                    clinicsForDecision = clinicsForDecision
                        .OrderBy(c => c.Distance ?? double.MaxValue)
                        .Take(3)
                        .ToList();
                }

                var bestClinic = clinicsForDecision
                    .OrderByDescending(c => c.Rating)
                    .ThenByDescending(c => c.TotalReviews)
                    .ThenBy(c => c.Distance ?? double.MaxValue)
                    .FirstOrDefault();

                if (bestClinic == null)
                {
                    var noClinicResponse = await _geminiClient.Models.GenerateContentAsync(
                        model: GeminiModelConfig.Default,
                        contents: $@"User said: '{request.Message}'.
No clinics were found for their filters.
Write one short helpful sentence.
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
                        Message = noClinicResponse.Candidates[0].Content.Parts[0].Text
                    };
                }

                var bestClinicResponse = await _geminiClient.Models.GenerateContentAsync(
                    model: GeminiModelConfig.Default,
                    contents: $@"User said: '{request.Message}'.
Best-rated clinic: {bestClinic.InstitutionName}
Rating: {bestClinic.Rating:0.##}
Total reviews: {bestClinic.TotalReviews}
Write one short sentence with the result.
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
                    Message = bestClinicResponse.Candidates[0].Content.Parts[0].Text,
                    Clinics = clinicsByRating
                        .OrderByDescending(c => c.Rating)
                        .ThenByDescending(c => c.TotalReviews)
                        .ThenBy(c => c.Distance ?? double.MaxValue)
                        .ToList(),
                };
            }

            var candidates = await _institutionService.GetPatientDoctorCandidatesAsync(
                null,
                institutionArg,
                request.UserCoordinates?.Latitude,
                request.UserCoordinates?.Longitude
            );

            if (!string.IsNullOrWhiteSpace(specialtyArg))
            {
                candidates = candidates
                    .Where(c => c.Specialties.Any(s => s.Contains(specialtyArg, StringComparison.OrdinalIgnoreCase)))
                    .ToList();
            }

            var ranked = candidates
                .OrderByDescending(c => c.Rating)
                .ThenByDescending(c => c.TotalReviews)
                .Take(top)
                .ToList();

            if (ranked.Count == 0)
            {
                return new AskResponseDto
                {
                    Message = "I couldn't find doctors for those filters. Please try a different clinic or specialty."
                };
            }

            var rankedJson = JsonSerializer.Serialize(ranked.Select(r => new
            {
                r.DoctorName,
                r.InstitutionName,
                r.YearsOfExperience,
                r.Rating,
                r.TotalReviews,
                r.Specialties,
            }));

            var rankingResponse = await _geminiClient.Models.GenerateContentAsync(
                model: GeminiModelConfig.Default,
                contents: $@"User said: '{request.Message}'.
Top doctor data: {rankedJson}
Write 1-2 concise sentences recommending the best options based on rating and reviews.
If relevant, mention years of experience.
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
                Message = rankingResponse.Candidates[0].Content.Parts[0].Text,
            };
        }
    }
}
