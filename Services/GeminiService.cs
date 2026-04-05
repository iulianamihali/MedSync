using Google.GenAI;
using Google.GenAI.Types;
using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.Services.IServices;
using System.Text.Json;

namespace MedSync.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly Client _geminiClient;
        private readonly IInstitutionService _institutionService;
        private readonly IPatientService _patientService;
        private readonly IAppointmentsService _appointmentService;
        private readonly IDoctorService _doctorService;

        public GeminiService(
            IConfiguration configuration,
            IInstitutionService institutionService,
            IPatientService patientService,
            IAppointmentsService appointmentsService,
            IDoctorService doctorService
        )
        {
            var apiKey = configuration["Gemini:ApiKey"];
            _geminiClient = new Client(apiKey: apiKey);
            _institutionService = institutionService;
            _patientService = patientService;
            _appointmentService = appointmentsService;
            _doctorService = doctorService;
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

            var tools = new List<Tool>
            {
                new Tool
                {
                    FunctionDeclarations = new List<FunctionDeclaration>
                    {
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
                                    ["doctorName"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Doctor name or partial name.",
                                    },
                                    ["date"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Date in yyyy-MM-dd. If missing, use today.",
                                    },
                                    ["time"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Optional specific hour like HH:mm when user asks if doctor is free at that time.",
                                    },
                                    ["institutionName"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Optional clinic/institution name if user mentions it.",
                                    },
                                },
                                Required = ["doctorName", "date"],
                            },
                        },
                        new FunctionDeclaration
                        {
                            Name = "rank_doctors",
                            Description =
                                "Use this when the user asks for the best/top doctor by rating or reviews, with optional clinic or specialty.",
                            Parameters = new Schema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, Schema>
                                {
                                    ["specialty"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Optional specialty filter.",
                                    },
                                    ["institutionName"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Optional clinic/institution filter.",
                                    },
                                    ["top"] = new Schema
                                    {
                                        Type = "integer",
                                        Description = "How many doctors to include. Default 3.",
                                    },
                                },
                            },
                        },
                        new FunctionDeclaration
                        {
                            Name = "get_doctor_summary",
                            Description =
                                "Use this when the user asks for doctor details: specialties, rating, reviews, or what the doctor does.",
                            Parameters = new Schema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, Schema>
                                {
                                    ["doctorName"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Doctor name or partial name.",
                                    },
                                    ["institutionName"] = new Schema
                                    {
                                        Type = "string",
                                        Description = "Optional clinic/institution filter.",
                                    },
                                },
                                Required = ["doctorName"],
                            },
                        },
                    },
                },
            };

            var contents = new List<Content>();

            foreach (var msg in request.ConversationHistory ?? [])
            {
                contents.Add(
                    new Content { Role = msg.Role, Parts = [new Part { Text = msg.Text }] }
                );
            }

            contents.Add(
                new Content { Role = "user", Parts = [new Part { Text = request.Message }] }
            );

            var response = await _geminiClient.Models.GenerateContentAsync(
                model: "gemini-3.1-flash-lite-preview",
                contents: contents,
                config: new GenerateContentConfig
                {
                    Tools = tools,
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
            );

            var part = response.Candidates[0].Content.Parts[0];

            if (part.FunctionCall != null)
            {
                var args = part.FunctionCall.Args;

                if (part.FunctionCall.Name == "rank_doctors")
                {
                    var specialtyArg = args.ContainsKey("specialty")
                        ? args["specialty"]?.ToString()
                        : null;
                    var institutionArg = args.ContainsKey("institutionName")
                        ? args["institutionName"]?.ToString()
                        : null;
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

                        var hasCoordinates = request.UserCoordinates?.Latitude != null
                            && request.UserCoordinates?.Longitude != null;
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
                                model: "gemini-3.1-flash-lite-preview",
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
                            model: "gemini-3.1-flash-lite-preview",
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
                        model: "gemini-3.1-flash-lite-preview",
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

                if (part.FunctionCall.Name == "get_doctor_summary")
                {
                    var doctorNameArg = args.ContainsKey("doctorName")
                        ? args["doctorName"]?.ToString()
                        : null;
                    if (string.IsNullOrWhiteSpace(doctorNameArg))
                    {
                        return new AskResponseDto { Message = "Please tell me the doctor's name." };
                    }

                    var institutionArg = args.ContainsKey("institutionName")
                        ? args["institutionName"]?.ToString()
                        : null;

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
                        model: "gemini-3.1-flash-lite-preview",
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

                if (part.FunctionCall.Name == "get_doctor_available_slots")
                {
                    var doctorNameArg = args.ContainsKey("doctorName")
                        ? args["doctorName"]?.ToString()
                        : null;
                    if (string.IsNullOrWhiteSpace(doctorNameArg))
                    {
                        return new AskResponseDto
                        {
                            Message = "Please tell me the doctor's name so I can check availability."
                        };
                    }

                    var dateStr = args.ContainsKey("date") ? args["date"]?.ToString() : null;
                    var timeStr = args.ContainsKey("time") ? args["time"]?.ToString() : null;
                    var institutionArg = args.ContainsKey("institutionName")
                        ? args["institutionName"]?.ToString()
                        : null;

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
                            doctorCandidates.Add((
                                doc.Id,
                                doc.Name ?? string.Empty,
                                clinic.InstitutionId,
                                clinic.InstitutionName
                            ));
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
                        model: "gemini-3.1-flash-lite-preview",
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

                var specialty = args.ContainsKey("specialty")
                    ? args["specialty"]?.ToString()
                    : null;
                if (string.IsNullOrEmpty(specialty))
                    specialty = null;

                var service = args.ContainsKey("service") ? args["service"]?.ToString() : null;
                if (string.IsNullOrEmpty(service))
                    service = null;

                var doctorName = args.ContainsKey("doctorName")
                    ? args["doctorName"]?.ToString()
                    : null;
                if (string.IsNullOrEmpty(doctorName))
                    doctorName = null;

                var institutionName = args.ContainsKey("institutionName")
                    ? args["institutionName"]?.ToString()
                    : null;
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
                    model: "gemini-3.1-flash-lite-preview",
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
                                    Text =
                                        "You are an empathetic medical assistant. Be concise, warm and human.",
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

            return new AskResponseDto { Message = part.Text ?? string.Empty };
        }

        public async Task<DoctorAskResponseDto> DoctorAskAsync(DoctorAskRequestDto request)
        {
            var doctorContext = await _doctorService.GetAIContextAsync(
                request.DoctorId,
                request.InstitutionId
            );
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

            var tools = new List<Tool>
    {
        new Tool
        {
            FunctionDeclarations = new List<FunctionDeclaration>
            {
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
                            ["fromDate"] = new Schema
                            {
                                Type = "string",
                                Description =
                                    "Start date in format yyyy-MM-dd. Default is today.",
                            },
                            ["toDate"] = new Schema
                            {
                                Type = "string",
                                Description =
                                    "End date in format yyyy-MM-dd. If the doctor asks about a specific day, use the same date for both fromDate and toDate. If the doctor asks about 'the future', 'all upcoming', 'pe viitor', use a date 30 days from today.",
                            },
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
                            ["patientName"] = new Schema
                            {
                                Type = "string",
                                Description =
                                    "Patient full name or partial name as written by the doctor.",
                            },
                            ["fromDate"] = new Schema
                            {
                                Type = "string",
                                Description =
                                    "Optional start date yyyy-MM-dd for filtering clinical history.",
                            },
                            ["toDate"] = new Schema
                            {
                                Type = "string",
                                Description =
                                    "Optional end date yyyy-MM-dd for filtering clinical history.",
                            },
                        },
                        Required = ["patientName"],
                    },
                },
                new FunctionDeclaration
                {
                    Name = "get_available_slots",
                    Description =
                        "Use this when the doctor asks when they are free, available slots, or free time intervals.",
                    Parameters = new Schema
                    {
                        Type = "object",
                        Properties = new Dictionary<string, Schema>
                        {
                            ["fromDate"] = new Schema
                            {
                                Type = "string",
                                Description =
                                    "Start date in yyyy-MM-dd. If missing, use today.",
                            },
                            ["toDate"] = new Schema
                            {
                                Type = "string",
                                Description =
                                    "End date in yyyy-MM-dd. If missing, use same day as fromDate or today+7.",
                            },
                            ["slotMinutes"] = new Schema
                            {
                                Type = "integer",
                                Description =
                                    "Optional slot duration in minutes. Default 30.",
                            },
                        },
                        Required = ["fromDate", "toDate"],
                    },
                },
            },
        },
    };

            var contents = new List<Content>();

            foreach (var msg in request.ConversationHistory ?? [])
            {
                contents.Add(
                    new Content { Role = msg.Role, Parts = [new Part { Text = msg.Text }] }
                );
            }

            contents.Add(
                new Content { Role = "user", Parts = [new Part { Text = request.Message }] }
            );

            var response = await _geminiClient.Models.GenerateContentAsync(
                model: "gemini-3.1-flash-lite-preview",
                contents: contents,
                config: new GenerateContentConfig
                {
                    Tools = tools,
                    SystemInstruction = new Content
                    {
                        Parts =
                        [
                            new Part
                    {
                        Text = $@"You are a helpful medical assistant for doctors on the MedSync platform.
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
- Avoid stiff or overly formal language. Write naturally, like a normal person would speak"
                    },
                        ],
                    },
                }
            );

            var part = response.Candidates[0].Content.Parts[0];

            if (part.FunctionCall != null)
            {
                var args = part.FunctionCall.Args;

                // --- SEARCH PATIENT SUMMARY ---
                if (part.FunctionCall.Name == "search_patient_summary")
                {
                    var patientName = args.ContainsKey("patientName")
                        ? args["patientName"]?.ToString()
                        : null;

                    if (string.IsNullOrWhiteSpace(patientName))
                    {
                        return new DoctorAskResponseDto
                        {
                            Message = "Please tell me the patient's name so I can search their history.",
                            Patients = []
                        };
                    }

                    var fromStrSummary = args.ContainsKey("fromDate")
                        ? args["fromDate"]?.ToString()
                        : null;
                    var toStrSummary = args.ContainsKey("toDate")
                        ? args["toDate"]?.ToString()
                        : null;

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
                        model: "gemini-3.1-flash-lite-preview",
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

                var fromStr = args.ContainsKey("fromDate") ? args["fromDate"]?.ToString() : null;
                var toStr = args.ContainsKey("toDate") ? args["toDate"]?.ToString() : null;

                // --- AVAILABLE SLOTS ---
                if (part.FunctionCall.Name == "get_available_slots")
                {
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
                        model: "gemini-3.1-flash-lite-preview",
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

                    var showSlots = request.Message.ToLower().Contains("arată") ||
                                    request.Message.ToLower().Contains("arata") ||
                                    request.Message.ToLower().Contains("list") ||
                                    request.Message.ToLower().Contains("show") ||
                                    request.Message.ToLower().Contains("toate") ||
                                    request.Message.ToLower().Contains("all");

                    return new DoctorAskResponseDto
                    {
                        Message = naturalSlotsResponse.Candidates[0].Content.Parts[0].Text,
                        AvailableSlots = showSlots ? availableSlots : null
                    };
                }

                // --- FUTURE APPOINTMENTS ---
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
                    model: "gemini-3.1-flash-lite-preview",
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

            return new DoctorAskResponseDto { Message = part.Text ?? string.Empty };
        }

    }
}
