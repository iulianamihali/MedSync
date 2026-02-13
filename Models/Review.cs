using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class Review
{
    public Guid Id { get; set; }

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid AppointmentId { get; set; }

    public virtual Appointment Appointment { get; set; } = null!;
}
