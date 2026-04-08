using Google.GenAI;
using Google.GenAI.Types;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.Services.AI;
using MedSync.Services.Handlers;
using MedSync.Services.Handlers.Doctor;
using MedSync.Services.IServices;

namespace MedSync.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly Client _geminiClient;
        private readonly IPatientService _patientService;
        private readonly IDoctorService _doctorService;
        private readonly Dictionary<string, IFunctionCallHandler> _patientFunctionHandlers;
        private readonly Dictionary<string, IDoctorFunctionCallHandler> _doctorFunctionHandlers;

        public GeminiService(
            IConfiguration configuration,
            IPatientService patientService,
            IDoctorService doctorService,
            IEnumerable<IFunctionCallHandler> patientFunctionHandlers,
            IEnumerable<IDoctorFunctionCallHandler> doctorFunctionHandlers
        )
        {
            var apiKey = configuration["Gemini:ApiKey"];
            _geminiClient = new Client(apiKey: apiKey);
            _patientService = patientService;
            _doctorService = doctorService;
            _patientFunctionHandlers = patientFunctionHandlers.ToDictionary(h => h.FunctionName);
            _doctorFunctionHandlers = doctorFunctionHandlers.ToDictionary(h => h.FunctionName);
        }

        public async Task<AskResponseDto> AskAsync(AskRequestDto request)
        {
            var patientContext = await _patientService.GetAIContextAsync(request.PatientId);
            var patientContextText =
                $@"
                PATIENT CONTEXT:
                - Name: {patientContext.PatientName}
                - Age: {patientContext.Age}
                - Gender: {patientContext.Gender}
                - Diagnoses: {(patientContext.Diagnoses.Any() ? string.Join(", ", patientContext.Diagnoses) : "none")}
                - Current medications: {(patientContext.Medications.Any() ? string.Join(", ", patientContext.Medications) : "none")}
                - Reported symptoms: {(patientContext.Symptoms.Any() ? string.Join(", ", patientContext.Symptoms) : "none")}
                - Referrals: {(patientContext.Referrals.Any() ? string.Join(", ", patientContext.Referrals) : "none")}
                - Doctors visited: {(patientContext.Doctors.Any() ? string.Join(", ", patientContext.Doctors) : "none")}
                - Last appointment: {patientContext.LastAppointmentSummary}
                - Total spent on appointments so far: {patientContext.TotalSpentOnAppointments:0.##}
                - Recent appointment spending details: {(patientContext.AppointmentSpendingDetails.Any() ? string.Join(" | ", patientContext.AppointmentSpendingDetails) : "none")}";

            var contents = new List<Content>();

            foreach (var msg in request.ConversationHistory ?? [])
            {
                contents.Add(new Content { Role = msg.Role, Parts = [new Part { Text = msg.Text }] });
            }

            contents.Add(new Content { Role = "user", Parts = [new Part { Text = request.Message }] });

            Google.GenAI.Types.GenerateContentResponse response;
            try
            {
                response = await GeminiRetryHelper.ExecuteWithRetryAsync(
                    () => _geminiClient.Models.GenerateContentAsync(
                        model: GeminiModelConfig.Default,
                        contents: contents,
                        config: new GenerateContentConfig
                        {
                            Tools = BuildPatientTools(),
                            SystemInstruction = new Content
                            {
                                Parts =
                                [
                                    new Part
                                    {
                                        Text =
                                            $@"You are an empathetic medical assistant for MedSync platform.
                    {patientContextText}
                       STRICT RULES:
                        - If user describes a NEW symptom, pain, or health problem → call search_clinics immediately
                        - If user asks for the best/top doctor by rating/reviews → call rank_doctors
                        - If user asks for doctor profile/summary/specialties/reviews → call get_doctor_summary
                        - If user mentions a specific doctor by name WITHOUT specifying a specialty → call search_clinics with ONLY doctorName, do NOT add specialty
                        - If user asks if a doctor is free or asks for available slots/hours or proposes a specific hour → call get_doctor_available_slots
                        - If user asks about their last appointment (doctor/date/time/clinic), answer directly from PATIENT CONTEXT
                        - If user asks how much they spent on appointments or asks for spending by appointment, answer directly from PATIENT CONTEXT
                        - If user mentions a specific clinic or institution by name → call search_clinics with institutionName
                        - If user asks for all clinics or all available options without specifying a specialty → call search_clinics with specialty = ""all"" or without any filter
                        - If user wants an appointment → call search_clinics immediately
                        - You can suggest options and next steps, but you CANNOT create, confirm, modify, or cancel appointments
                        - Never say an appointment is booked/confirmed/canceled/rescheduled
                        - If user asks to book, instruct them to select a clinic/doctor/slot in the app flow
                        - If user is asking a follow-up question, correcting you, or having a normal conversation → respond naturally with text, do NOT call search_clinics
                        - If user asks a general medical question → answer concisely
                        - For ANY non-medical question (math, geography, general knowledge, homework, etc.) → politely refuse and redirect to medical topics
                        - Never make diagnoses
                        - Always respond in the same language the user writes in
                        - Do NOT repeatedly bring up the same medical concerns if the user has already acknowledged them or has an appointment scheduled
                        - Be helpful and answer what the user asks, don't redirect every message to their existing conditions
                        - Today's date is {DateTime.Today:yyyy-MM-dd}. Use this to calculate if medications have expired based on their prescribed date and duration.
                        - IMPORTANT: Only reference the patient's medical history if it is DIRECTLY relevant to what they are asking. 
                        - Do NOT bring up past symptoms or conditions unprompted in every response.
                        - Answer ONLY what the user asks — do not add unrequested medical advice
                        IMPORTANT: Use context from conversation history to understand if the user is describing symptoms or just talking.",
                                    },
                                ],
                            },
                        }
                    )
                );
            }
            catch (ServerError)
            {
                return new AskResponseDto
                {
                    Message = "The AI service is currently experiencing high demand. Please try again in a few seconds."
                };
            }

            var part = response.Candidates[0].Content.Parts[0];

            if (part.FunctionCall != null)
            {
                var args = part
                    .FunctionCall.Args
                    .ToDictionary(kvp => kvp.Key, kvp => (object)(kvp.Value ?? string.Empty));

                if (_patientFunctionHandlers.TryGetValue(part.FunctionCall.Name, out var handler))
                {
                    try
                    {
                        return await handler.HandleAsync(request, args);
                    }
                    catch (ServerError)
                    {
                        return new AskResponseDto
                        {
                            Message = "The AI service is currently experiencing high demand. Please try again in a few seconds."
                        };
                    }
                }
            }

            return new AskResponseDto { Message = part.Text ?? string.Empty };
        }

        public async Task<DoctorAskResponseDto> DoctorAskAsync(DoctorAskRequestDto request)
        {
            var doctorContext = await _doctorService.GetAIContextAsync(request.DoctorId, request.InstitutionId);
            var doctorContextText =
                $@"
    DOCTOR CONTEXT:
    - Name: {doctorContext.DoctorName}
    - Institution: {doctorContext.InstitutionName}
    - Years of experience: {doctorContext.YearsOfExperience}
    - University: {doctorContext.UniversityName ?? "none"}
    - Specialties: {(doctorContext.Specialties.Any() ? string.Join(", ", doctorContext.Specialties) : "none")}
    - Services: {(doctorContext.Services.Any() ? string.Join(", ", doctorContext.Services) : "none")}
    - Schedule: {(doctorContext.Schedule.Any() ? string.Join(" | ", doctorContext.Schedule.Select(s => $"{s.DayOfWeek}: {s.StartTime}-{s.EndTime}")) : "none")}";
            var contents = new List<Content>();

            foreach (var msg in request.ConversationHistory ?? [])
            {
                contents.Add(new Content { Role = msg.Role, Parts = [new Part { Text = msg.Text }] });
            }

            contents.Add(new Content { Role = "user", Parts = [new Part { Text = request.Message }] });

            Google.GenAI.Types.GenerateContentResponse response;
            try
            {
                response = await GeminiRetryHelper.ExecuteWithRetryAsync(
                    () => _geminiClient.Models.GenerateContentAsync(
                        model: GeminiModelConfig.Default,
                        contents: contents,
                        config: new GenerateContentConfig
                        {
                            Tools = BuildDoctorTools(),
                            SystemInstruction = new Content
                            {
                                Parts =
                                [
                                    new Part
                                    {
                                        Text =
                                            $@"You are a helpful medical assistant for doctors on the MedSync platform.
{doctorContextText}
Today's date is {DateTime.Today:yyyy-MM-dd}.
STRICT RULES:
- If the doctor asks about their schedule, appointments, or agenda → call get_future_appointments
- If the doctor asks about a patient by name or asks for patient history/details → call search_patient_summary
- If the doctor asks about free time, available slots, or when they are available → call get_available_slots
- If the doctor asks 'who am I', 'cine sunt eu', or about their own info → answer using the DOCTOR CONTEXT above, do NOT call any function
- If the doctor asks BOTH about themselves AND appointments in the same message → answer the personal question with text from DOCTOR CONTEXT, AND call get_future_appointments for the appointments
- If the doctor asks a general medical question → answer concisely
- For ANY non-medical question → politely refuse and redirect to medical topics
- ALWAYS respond in the SAME language the doctor writes in
- Do NOT use markdown formatting like ** or *
- Be casual and friendly, like a colleague talking to another colleague
- Do NOT repeat the doctor's full name, titles, or specialties unless specifically asked
- Keep responses short, maximum 1-2 sentences
- You are an ASSISTANT talking TO the doctor. Use 'you' when referring to the doctor, never 'I' or 'we'
- Avoid stiff or overly formal language. Write naturally, like a normal person would speak",
                                    },
                                ],
                            },
                        }
                    )
                );
            }
            catch (ServerError)
            {
                return new DoctorAskResponseDto
                {
                    Message = "The AI service is currently experiencing high demand. Please try again in a few seconds."
                };
            }

            var part = response.Candidates[0].Content.Parts[0];

            if (part.FunctionCall != null)
            {
                var args = part
                    .FunctionCall.Args
                    .ToDictionary(kvp => kvp.Key, kvp => (object)(kvp.Value ?? string.Empty));

                if (_doctorFunctionHandlers.TryGetValue(part.FunctionCall.Name, out var handler))
                {
                    try
                    {
                        return await handler.HandleAsync(request, args);
                    }
                    catch (ServerError)
                    {
                        return new DoctorAskResponseDto
                        {
                            Message = "The AI service is currently experiencing high demand. Please try again in a few seconds."
                        };
                    }
                }
            }

            return new DoctorAskResponseDto { Message = part.Text ?? string.Empty };
        }

        private static List<Tool> BuildPatientTools() =>
            [
                new Tool
                {
                    FunctionDeclarations =
                    [
                        new FunctionDeclaration
                        {
                            Name = "search_clinics",
                            Description =
                                "ALWAYS use this function when the user mentions any pain, symptom, health problem, or wants to find a doctor or clinic. Examples: headache, chest pain, heart pain, fever, I feel sick, I need a doctor.",
                            Parameters = new Schema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, Schema>
                                {
                                    ["specialty"] = new Schema
                                    {
                                        Type = "string",
                                        Description =
                                            "Medical specialty in English exactly as: Cardiology, Neurology, Dermatology, Pediatrics, Gynecology, Ophthalmology, Otolaryngology (ENT), Orthopedics, Psychiatry, Family Medicine, Internal Medicine, Gastroenterology, Urology, Medical Analysis, Stomatology",
                                    },
                                    ["service"] = new Schema
                                    {
                                        Type = "string",
                                        Description =
                                            "Medical service in English exactly as: Initial Consultation, Follow-up Checkup, Online Consultation, Medical Certificate, Abdominal Ultrasound, Cardiac Ultrasound, EKG / ECG, MRI Scan, Dental Cleaning & Scaling, Tooth Extraction, Dental Filling, Blood Tests (Complete Panel), Pap Smear Test, Dermatoscopy, Wound Dressing",
                                    },
                                    ["doctorName"] = new Schema
                                    {
                                        Type = "string",
                                        Description =
                                            "Name or partial name of a specific doctor the patient wants to visit (e.g. 'Ionescu', 'Pop'). Use this ONLY when the user mentions a specific doctor by name.",
                                    },
                                    ["institutionName"] = new Schema
                                    {
                                        Type = "string",
                                        Description =
                                            "Name or partial name of a specific clinic or institution the patient wants to visit (e.g. 'Policlinica', 'Regina Maria'). Use this ONLY when the user mentions a specific clinic by name.",
                                    },
                                },
                                Required = ["specialty"],
                            },
                        },
                        new FunctionDeclaration
                        {
                            Name = "get_doctor_available_slots",
                            Description =
                                "Use this when the patient asks if a doctor is free, asks for available hours, or wants an appointment at a specific time.",
                            Parameters = new Schema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, Schema>
                                {
                                    ["doctorName"] = new Schema { Type = "string", Description = "Doctor name or partial name." },
                                    ["date"] = new Schema { Type = "string", Description = "Date in yyyy-MM-dd. If missing, use today." },
                                    ["time"] = new Schema { Type = "string", Description = "Optional specific hour like HH:mm when user asks if doctor is free at that time." },
                                    ["institutionName"] = new Schema { Type = "string", Description = "Optional clinic/institution name if user mentions it." },
                                },
                                Required = ["doctorName", "date"],
                            },
                        },
                        new FunctionDeclaration
                        {
                            Name = "rank_doctors",
                            Description = "Use this when the user asks for the best/top doctor by rating or reviews, with optional clinic or specialty.",
                            Parameters = new Schema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, Schema>
                                {
                                    ["specialty"] = new Schema { Type = "string", Description = "Optional specialty filter." },
                                    ["institutionName"] = new Schema { Type = "string", Description = "Optional clinic/institution filter." },
                                    ["top"] = new Schema { Type = "integer", Description = "How many doctors to include. Default 3." },
                                },
                            },
                        },
                        new FunctionDeclaration
                        {
                            Name = "get_doctor_summary",
                            Description = "Use this when the user asks for doctor details: specialties, rating, reviews, or what the doctor does.",
                            Parameters = new Schema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, Schema>
                                {
                                    ["doctorName"] = new Schema { Type = "string", Description = "Doctor name or partial name." },
                                    ["institutionName"] = new Schema { Type = "string", Description = "Optional clinic/institution filter." },
                                },
                                Required = ["doctorName"],
                            },
                        },
                    ],
                },
            ];

        private static List<Tool> BuildDoctorTools() =>
            [
                new Tool
                {
                    FunctionDeclarations =
                    [
                        new FunctionDeclaration
                        {
                            Name = "get_future_appointments",
                            Description =
                                "Use this when the doctor asks about their upcoming appointments, schedule, or agenda. Examples: 'ce programări am mâine?', 'what do I have on Friday?', 'ce programări am pe viitor?', 'câte programări confirmate am?'",
                            Parameters = new Schema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, Schema>
                                {
                                    ["fromDate"] = new Schema { Type = "string", Description = "Start date in format yyyy-MM-dd. Default is today." },
                                    ["toDate"] = new Schema { Type = "string", Description = "End date in format yyyy-MM-dd. If the doctor asks about a specific day, use the same date for both fromDate and toDate. If the doctor asks about 'the future', 'all upcoming', 'pe viitor', use a date 30 days from today." },
                                },
                                Required = ["fromDate", "toDate"],
                            },
                        },
                        new FunctionDeclaration
                        {
                            Name = "search_patient_summary",
                            Description =
                                "Use this when the doctor asks about a patient by name (symptoms, diagnosis, medications, referrals, prescriptions, history).",
                            Parameters = new Schema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, Schema>
                                {
                                    ["patientName"] = new Schema { Type = "string", Description = "Patient full name or partial name as written by the doctor." },
                                    ["fromDate"] = new Schema { Type = "string", Description = "Optional start date yyyy-MM-dd for filtering clinical history." },
                                    ["toDate"] = new Schema { Type = "string", Description = "Optional end date yyyy-MM-dd for filtering clinical history." },
                                },
                                Required = ["patientName"],
                            },
                        },
                        new FunctionDeclaration
                        {
                            Name = "get_available_slots",
                            Description = "Use this when the doctor asks when they are free, available slots, or free time intervals.",
                            Parameters = new Schema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, Schema>
                                {
                                    ["fromDate"] = new Schema { Type = "string", Description = "Start date in yyyy-MM-dd. If missing, use today." },
                                    ["toDate"] = new Schema { Type = "string", Description = "End date in yyyy-MM-dd. If missing, use same day as fromDate or today+7." },
                                    ["slotMinutes"] = new Schema { Type = "integer", Description = "Optional slot duration in minutes. Default 30." },
                                },
                                Required = ["fromDate", "toDate"],
                            },
                        },
                    ],
                },
            ];
    }
}
