using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class Review
{
    public Guid Id { get; set; }

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid UserId { get; set; }

    public Guid DoctorId { get; set; }

    public Guid InstitutionId { get; set; }

    public virtual Doctor Doctor { get; set; } = null!;

    public virtual Institution Institution { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
