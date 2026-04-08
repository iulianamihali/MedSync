using Google.GenAI;
using Google.GenAI.Types;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.Services.AI;
using MedSync.Services.Handlers;
using MedSync.Services.IServices;

namespace MedSync.Services.Handlers.Patient
{
    public class GetDoctorSlotsHandler : IFunctionCallHandler
    {
        private readonly IInstitutionService _institutionService;
        private readonly IDoctorService _doctorService;
        private readonly Client _geminiClient;

        public GetDoctorSlotsHandler(
            IInstitutionService institutionService,
            IDoctorService doctorService,
            Client geminiClient
        )
        {
            _institutionService = institutionService;
            _doctorService = doctorService;
            _geminiClient = geminiClient;
        }

        public string FunctionName => "get_doctor_available_slots";

        public async Task<AskResponseDto> HandleAsync(AskRequestDto request, Dictionary<string, object> args)
        {
            var doctorNameArg = args.ContainsKey("doctorName") ? args["doctorName"]?.ToString() : null;
            if (string.IsNullOrWhiteSpace(doctorNameArg))
            {
                return new AskResponseDto
                {
                    Message = "Please tell me the doctor's name so I can check availability."
                };
            }

            var dateStr = args.ContainsKey("date") ? args["date"]?.ToString() : null;
            var timeStr = args.ContainsKey("time") ? args["time"]?.ToString() : null;
            var institutionArg = args.ContainsKey("institutionName") ? args["institutionName"]?.ToString() : null;

            var date = DateTime.TryParse(dateStr, out var parsedDate)
                ? parsedDate.Date
                : DateTime.UtcNow.Date;

            var clinicsByDoctor = await _institutionService.GetInstitutionsBySpecialtyAndServiceAsync(
                null,
                null,
                request.UserCoordinates?.Latitude,
                request.UserCoordinates?.Longitude,
                doctorNameArg,
                institutionArg
            ) ?? [];

            if (clinicsByDoctor.Count == 0)
            {
                clinicsByDoctor = await _institutionService.GetInstitutionsBySpecialtyAndServiceAsync(
                    null,
                    null,
                    request.UserCoordinates?.Latitude,
                    request.UserCoordinates?.Longitude,
                    null,
                    institutionArg
                ) ?? [];
            }

            var doctorCandidates = new List<(Guid DoctorId, string DoctorName, Guid InstitutionId, string InstitutionName)>();
            foreach (var clinic in clinicsByDoctor)
            {
                var doctorsInClinic = await _institutionService.GetDoctorsInfoTabAsync(clinic.InstitutionId);
                foreach (var doc in doctorsInClinic)
                {
                    doctorCandidates.Add((doc.Id, doc.Name ?? string.Empty, clinic.InstitutionId, clinic.InstitutionName));
                }
            }

            var doctorMatches = doctorCandidates
                .Where(x => x.DoctorName.Contains(doctorNameArg, StringComparison.OrdinalIgnoreCase))
                .DistinctBy(x => new { x.DoctorId, x.InstitutionId })
                .ToList();

            if (doctorMatches.Count == 0)
            {
                return new AskResponseDto
                {
                    Message = "I couldn't find a doctor with that name. Could you try another variation of the name?",
                    Clinics = clinicsByDoctor,
                };
            }

            if (doctorMatches.Count > 1)
            {
                return new AskResponseDto
                {
                    Message = "I found multiple doctors with that name. Please choose the clinic or provide the full name so I can check exact availability.",
                    Clinics = clinicsByDoctor,
                };
            }

            var selectedDoctor = doctorMatches[0];
            var availableSlots = await _doctorService.GetAvailableSlotsAsync(
                selectedDoctor.DoctorId,
                selectedDoctor.InstitutionId,
                date,
                date,
                30
            );

            var hasSpecificTime = TimeOnly.TryParse(timeStr, out var requestedTime);
            var isFreeAtRequestedTime = hasSpecificTime
                && availableSlots.Any(s =>
                    s.Start.TimeOfDay <= requestedTime.ToTimeSpan()
                    && requestedTime.ToTimeSpan() < s.End.TimeOfDay
                );

            var naturalAvailabilityResponse = await _geminiClient.Models.GenerateContentAsync(
                model: GeminiModelConfig.Default,
                contents: $@"User said: '{request.Message}'.
Doctor selected: {selectedDoctor.DoctorName} at {selectedDoctor.InstitutionName}.
Date checked: {date:yyyy-MM-dd}.
Total free slots found: {availableSlots.Count}.
Requested specific time: {(hasSpecificTime ? requestedTime.ToString("HH:mm") : "none")}.
Is requested time free: {(isFreeAtRequestedTime ? "yes" : "no")}.
Write 1-2 short natural sentences.
If user asked for a specific hour, answer clearly if that hour is free.
Do NOT ask to confirm a reservation.
Do NOT say the appointment is booked, reserved, or confirmed.
If the hour is available, tell them they can continue booking in the app by selecting that slot.
Do NOT list all slots in text; slots are shown separately.
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
                Message = naturalAvailabilityResponse.Candidates[0].Content.Parts[0].Text,
                Clinics = clinicsByDoctor,
                AvailableSlots = availableSlots,
            };
        }
    }
}
