using Google.GenAI;
using Google.GenAI.Types;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.Services.AI;
using MedSync.Services.IServices;

namespace MedSync.Services.Handlers.Doctor
{
    public class AvailableSlotsHandler : IDoctorFunctionCallHandler
    {
        private readonly IDoctorService _doctorService;
        private readonly Client _geminiClient;

        public AvailableSlotsHandler(IDoctorService doctorService, Client geminiClient)
        {
            _doctorService = doctorService;
            _geminiClient = geminiClient;
        }

        public string FunctionName => "get_available_slots";

        public async Task<DoctorAskResponseDto> HandleAsync(DoctorAskRequestDto request, Dictionary<string, object> args)
        {
            var fromStr = args.ContainsKey("fromDate") ? args["fromDate"]?.ToString() : null;
            var toStr = args.ContainsKey("toDate") ? args["toDate"]?.ToString() : null;

            var slotMinutes = 30;
            if (args.ContainsKey("slotMinutes") && int.TryParse(args["slotMinutes"]?.ToString(), out var parsedSlot))
            {
                slotMinutes = parsedSlot;
            }

            var fromDateSlots = DateTime.TryParse(fromStr, out var parsedFromSlots)
                ? parsedFromSlots
                : DateTime.UtcNow.Date;
            var toDateSlots = DateTime.TryParse(toStr, out var parsedToSlots)
                ? parsedToSlots
                : fromDateSlots;

            var availableSlots = await _doctorService.GetAvailableSlotsAsync(
                request.DoctorId,
                request.InstitutionId,
                fromDateSlots,
                toDateSlots,
                slotMinutes
            );

            var slotsText = "no free slots";
            if (availableSlots.Count > 0)
            {
                var grouped = availableSlots
                    .GroupBy(s => s.Start.Date)
                    .Select(g =>
                    {
                        var dayName = g.Key.ToString("dddd, yyyy-MM-dd");
                        var first = g.First().Start.ToString("HH:mm");
                        var last = g.Last().End.ToString("HH:mm");
                        return $"{dayName}: free from {first} to {last} ({g.Count()} slots)";
                    });
                slotsText = string.Join("; ", grouped);
            }

            var naturalSlotsResponse = await _geminiClient.Models.GenerateContentAsync(
                model: GeminiModelConfig.Default,
                contents: $@"The doctor asked: '{request.Message}'.
Available slots between {fromDateSlots:yyyy-MM-dd} and {toDateSlots:yyyy-MM-dd}: {slotsText}.
RULES:
- If the doctor asked a yes/no question like 'am I free at 14?' → answer with a short yes or no, mention the time
- If the doctor asked 'when am I free?' or 'what is my availability?' → summarize the free time range, do NOT list every single slot
- If the doctor explicitly asks to SEE or LIST all available slots → say you are showing them below
- Keep it short, 1-2 sentences max
- Do NOT use markdown formatting
{(availableSlots.Count == 0 ? "Tell them they have no free slots for this period." : "")}
CRITICAL: Respond in the EXACT same language as: '{request.Message}'.",
                config: new GenerateContentConfig
                {
                    SystemInstruction = new Content
                    {
                        Parts =
                        [
                            new Part
                            {
                                Text = $"You are a friendly casual medical assistant. Keep it short and simple. Respond in the same language as: '{request.Message}'"
                            },
                        ],
                    },
                }
            );

            var showSlots = request.Message.ToLower().Contains("arată")
                            || request.Message.ToLower().Contains("arata")
                            || request.Message.ToLower().Contains("list")
                            || request.Message.ToLower().Contains("show")
                            || request.Message.ToLower().Contains("toate")
                            || request.Message.ToLower().Contains("all");

            return new DoctorAskResponseDto
            {
                Message = naturalSlotsResponse.Candidates[0].Content.Parts[0].Text,
                AvailableSlots = showSlots ? availableSlots : null
            };
        }
    }
}
