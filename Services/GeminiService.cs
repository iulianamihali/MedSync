using Google.GenAI;
using Google.GenAI.Types;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.Models;
using MedSync.Services.IServices;

namespace MedSync.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly Client _geminiClient;
        private readonly IInstitutionService _institutionService;
        private readonly IPatientService _patientService;
        public GeminiService(IConfiguration configuration, IInstitutionService institutionService, IPatientService patientService)
        {
            var apiKey = configuration["Gemini:ApiKey"];
            _geminiClient = new Client(apiKey: apiKey);
            _institutionService = institutionService;
            _patientService = patientService;
        }

        public async Task<AskResponseDto> AskAsync(AskRequestDto request)
        {
            var patientContext = await _patientService.GetAIContextAsync(request.PatientId);
            var patientContextText = $@"
                PATIENT CONTEXT:
                - Name: {patientContext.PatientName}
                - Age: {patientContext.Age}
                - Gender: {patientContext.Gender}
                - Diagnoses: {(patientContext.Diagnoses.Any() ? string.Join(", ", patientContext.Diagnoses) : "none")}
                - Current medications: {(patientContext.Medications.Any() ? string.Join(", ", patientContext.Medications) : "none")}
                - Reported symptoms: {(patientContext.Symptoms.Any() ? string.Join(", ", patientContext.Symptoms) : "none")}
                - Referrals: {(patientContext.Referrals.Any() ? string.Join(", ", patientContext.Referrals) : "none")}
                -Doctors visited: { (patientContext.Doctors.Any() ? string.Join(", ", patientContext.Doctors) : "none")}";

            var tools = new List<Tool>
            {
                new Tool
                {
                    FunctionDeclarations = new List<FunctionDeclaration>
                    {
                        new FunctionDeclaration
                        {
                            Name = "search_clinics",
                            Description = "ALWAYS use this function when the user mentions any pain, symptom, health problem, or wants to find a doctor or clinic. Examples: headache, chest pain, heart pain, fever, I feel sick, I need a doctor.",
                            Parameters = new Schema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, Schema>
                                {
                                    ["specialty"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Medical specialty in English exactly as: Cardiology, Neurology, Dermatology, Pediatrics, Gynecology, Ophthalmology, Otolaryngology (ENT), Orthopedics, Psychiatry, Family Medicine, Internal Medicine, Gastroenterology, Urology, Medical Analysis, Stomatology"
                                    },
                                    ["service"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Medical service in English exactly as: Initial Consultation, Follow-up Checkup, Online Consultation, Medical Certificate, Abdominal Ultrasound, Cardiac Ultrasound, EKG / ECG, MRI Scan, Dental Cleaning & Scaling, Tooth Extraction, Dental Filling, Blood Tests (Complete Panel), Pap Smear Test, Dermatoscopy, Wound Dressing"
                                    },
                                    ["doctorName"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Name or partial name of a specific doctor the patient wants to visit (e.g. 'Ionescu', 'Pop'). Use this ONLY when the user mentions a specific doctor by name."
                                    },
                                    ["institutionName"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Name or partial name of a specific clinic or institution the patient wants to visit (e.g. 'Policlinica', 'Regina Maria'). Use this ONLY when the user mentions a specific clinic by name."
                                    }
                                },
                                Required = ["specialty"]
                            }
                        }
                    }
                }
            };


            var contents = new List<Content>();

            foreach (var msg in request.ConversationHistory ?? [])
            {
                contents.Add(new Content
                {
                    Role = msg.Role,
                    Parts = [new Part { Text = msg.Text }]
                });
            }

            contents.Add(new Content
            {
                Role = "user",
                Parts = [new Part { Text = request.Message }]
            });

            var response = await _geminiClient.Models.GenerateContentAsync(
                model: "gemini-3.1-flash-lite-preview",
                contents: contents,
                config: new GenerateContentConfig
                {
                    Tools = tools,
                    SystemInstruction = new Content
                    {
                        Parts = [new Part { Text = $@"You are an empathetic medical assistant for MedSync platform.
                    {patientContextText}
                       STRICT RULES:
                        - If user describes a NEW symptom, pain, or health problem → call search_clinics immediately
                        - If user mentions a specific doctor by name WITHOUT specifying a specialty → call search_clinics with ONLY doctorName, do NOT add specialty
                        - If user mentions a specific clinic or institution by name → call search_clinics with institutionName
                        - If user wants an appointment → call search_clinics immediately
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
                        IMPORTANT: Use context from conversation history to understand if the user is describing symptoms or just talking." }]
                    }
                }
            );

            var part = response.Candidates[0].Content.Parts[0];
         
            if (part.FunctionCall != null)
            {
                var args = part.FunctionCall.Args;
                var specialty = args.ContainsKey("specialty") ? args["specialty"]?.ToString() : null;
                if (string.IsNullOrEmpty(specialty)) specialty = null;

                var service = args.ContainsKey("service") ? args["service"]?.ToString() : null;
                if (string.IsNullOrEmpty(service)) service = null;

                var doctorName = args.ContainsKey("doctorName") ? args["doctorName"]?.ToString() : null;
                if (string.IsNullOrEmpty(doctorName)) doctorName = null;

                var institutionName = args.ContainsKey("institutionName") ? args["institutionName"]?.ToString() : null;
                if (string.IsNullOrEmpty(institutionName)) institutionName = null;

                var clinics = await _institutionService.GetInstitutionsBySpecialtyAndServiceAsync(
                    specialty, service, request.UserCoordinates?.Latitude, request.UserCoordinates?.Longitude, doctorName, institutionName
                );

                var naturalResponse = await _geminiClient.Models.GenerateContentAsync(
                    model: "gemini-3.1-flash-lite-preview",
                  contents: $@"User said: '{request.Message}'.
                    {(doctorName != null ? $"They want to book an appointment with doctor: {doctorName}." : $"They need a clinic for specialty: {specialty}.")}
                    You found {clinics.Count} clinic(s).
                    Write 1-2 sentences acknowledging their request naturally and presenting the results.
                    Do NOT mention clinic names, addresses, or any placeholders — the clinic details are shown separately.
                    Do NOT use markdown formatting like ** or *.
                    {(clinics.Count == 0 ? "Apologize and suggest they try a different search." : "")}
                    Respond in the same language as the user.",
                    config: new GenerateContentConfig
                    {
                        SystemInstruction = new Content
                        {
                            Parts = [new Part { Text = "You are an empathetic medical assistant. Be concise, warm and human." }]
                        }
                    }
                );

                return new AskResponseDto
                {
                    Message = naturalResponse.Candidates[0].Content.Parts[0].Text,
                    Clinics = clinics
                };
            }

            return new AskResponseDto
            {
                Message = part.Text ?? string.Empty
            };
        }
    }
}