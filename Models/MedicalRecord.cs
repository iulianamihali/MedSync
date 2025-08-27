using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class MedicalRecord
{
    public Guid RecordId { get; set; }

    public Guid PatientId { get; set; }

    public Guid DoctorId { get; set; }

    public int Type { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public int Visibility { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Doctor Doctor { get; set; } = null!;

    public virtual Patient Patient { get; set; } = null!;
}
