using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class PatientAccess
{
    public Guid OwnerPatientId { get; set; }

    public Guid ViewerId { get; set; }

    public string Scope { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public virtual Patient OwnerPatient { get; set; } = null!;

    public virtual User Viewer { get; set; } = null!;
}
