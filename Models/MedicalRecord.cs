using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class MedicalRecord
{
    public Guid Id { get; set; }

    public Guid AppointmentId { get; set; }

    public string? Investigation { get; set; }
    public string? InvestigationResult { get; set; }
    public string? Symptoms { get; set; }
    public string? Diagnosis { get; set; }
    public string? Recommendations { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public virtual Appointment Appointment { get; set; } = null!;
}
