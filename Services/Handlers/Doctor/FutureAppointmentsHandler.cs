using Google.GenAI;
using Google.GenAI.Types;
using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.Services.AI;
using MedSync.Services.IServices;

namespace MedSync.Services.Handlers.Doctor
{
    public class FutureAppointmentsHandler : IDoctorFunctionCallHandler
    {
        private readonly IAppointmentsService _appointmentService;
        private readonly Client _geminiClient;

        public FutureAppointmentsHandler(IAppointmentsService appointmentService, Client geminiClient)
        {
            _appointmentService = appointmentService;
            _geminiClient = geminiClient;
        }

        public string FunctionName => "get_future_appointments";

        public async Task<DoctorAskResponseDto> HandleAsync(DoctorAskRequestDto request, Dictionary<string, object> args)
        {
            var fromStr = args.ContainsKey("fromDate") ? args["fromDate"]?.ToString() : null;
            var toStr = args.ContainsKey("toDate") ? args["toDate"]?.ToString() : null;

            var fromDate = DateTime.TryParse(fromStr, out var parsedFrom)
                ? parsedFrom
                : DateTime.UtcNow.Date;
            var toDate = DateTime.TryParse(toStr, out var parsedTo)
                ? parsedTo
                : DateTime.UtcNow.Date.AddDays(30);

            var appointments = await _appointmentService.GetCalendarAppointmentsByDoctorAsync(
                new CalendarAppointmentsRequestDto
                {
                    InstitutionId = request.InstitutionId,
                    DoctorId = request.DoctorId,
                    From = fromDate,
                    To = toDate,
                }
            );

            var messageLower = request.Message.ToLowerInvariant();
            var asksCalendarDate =
                messageLower.Contains("pe cand")
                || messageLower.Contains("data")
                || messageLower.Contains("calendar")
                || messageLower.Contains("when")
                || messageLower.Contains("date");

            var nextAppointment = appointments
                .OrderBy(a => a.StartDateTimeUtc)
                .FirstOrDefault();
            var nextAppointmentDate = nextAppointment?.StartDateTimeUtc.ToString("yyyy-MM-dd") ?? "none";

            var naturalResponse = await _geminiClient.Models.GenerateContentAsync(
                model: GeminiModelConfig.Default,
                contents: $@"The doctor asked: '{request.Message}'.
You found {appointments.Count} appointment(s) between {fromDate:yyyy-MM-dd} and {toDate:yyyy-MM-dd}.
User is asking for calendar date explicitly: {(asksCalendarDate ? "yes" : "no")}.
Next appointment calendar date: {nextAppointmentDate}.
Write 1 short friendly sentence about the results.
If user asks for the date, explicitly mention the calendar date.
Do NOT mention the doctor's name, specialties, or institution.
Do NOT list appointment details — they are shown as cards below.
Do NOT use markdown formatting.
Be warm and simple, like talking to a friend.
{(appointments.Count == 0 ? "Tell them they have no appointments for this period." : "")}
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

            return new DoctorAskResponseDto
            {
                Message = naturalResponse.Candidates[0].Content.Parts[0].Text,
                UpcomingAppointments = appointments,
            };
        }
    }
}
