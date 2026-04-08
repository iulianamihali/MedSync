using Google.GenAI;
using Google.GenAI.Types;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.Services.AI;
using MedSync.Services.IServices;
using System.Text.Json;

namespace MedSync.Services.Handlers.Doctor
{
    public class PatientSummaryHandler : IDoctorFunctionCallHandler
    {
        private readonly IDoctorService _doctorService;
        private readonly Client _geminiClient;

        public PatientSummaryHandler(IDoctorService doctorService, Client geminiClient)
        {
            _doctorService = doctorService;
            _geminiClient = geminiClient;
        }

        public string FunctionName => "search_patient_summary";

        public async Task<DoctorAskResponseDto> HandleAsync(DoctorAskRequestDto request, Dictionary<string, object> args)
        {
            var patientName = args.ContainsKey("patientName") ? args["patientName"]?.ToString() : null;

            if (string.IsNullOrWhiteSpace(patientName))
            {
                return new DoctorAskResponseDto
                {
                    Message = "Please tell me the patient's name so I can search their history.",
                    Patients = []
                };
            }

            var fromStrSummary = args.ContainsKey("fromDate") ? args["fromDate"]?.ToString() : null;
            var toStrSummary = args.ContainsKey("toDate") ? args["toDate"]?.ToString() : null;

            var fromSummary = DateTime.TryParse(fromStrSummary, out var parsedFromSummary)
                ? parsedFromSummary
                : (DateTime?)null;
            var toSummary = DateTime.TryParse(toStrSummary, out var parsedToSummary)
                ? parsedToSummary
                : (DateTime?)null;

            var patients = await _doctorService.SearchPatientSummariesAsync(
                request.DoctorId,
                request.InstitutionId,
                patientName,
                fromSummary,
                toSummary
            );

            var patientsJson = JsonSerializer.Serialize(patients);

            var naturalPatientResponse = await _geminiClient.Models.GenerateContentAsync(
                model: GeminiModelConfig.Default,
                contents: $@"The doctor asked: '{request.Message}'.
You found {patients.Count} matching patient summary result(s).
Patient summary data (safe, no personal identifiers): {patientsJson}
If doctor asks for a specific detail (symptoms/diagnoses/medications/referrals/recommendations), answer exactly that detail from the summary data.
If doctor asks for full summary, provide a short structured summary.
If multiple patients match, briefly ask which patient they mean.
{(patients.Count == 0 ? "If none found, suggest trying another spelling or adding a date interval." : "")}
CRITICAL: Respond in the EXACT same language as: '{request.Message}'.",
                config: new GenerateContentConfig
                {
                    SystemInstruction = new Content
                    {
                        Parts =
                        [
                            new Part
                            {
                                Text = $"You are a concise medical assistant for doctors. Use only the provided patient summary data. Do not invent details. Respond in the same language as: '{request.Message}'"
                            },
                        ],
                    },
                }
            );

            return new DoctorAskResponseDto
            {
                Message = naturalPatientResponse.Candidates[0].Content.Parts[0].Text,
                Patients = patients
            };
        }
    }
}
