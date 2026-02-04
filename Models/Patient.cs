using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class Patient
{
    public Guid UserId { get; set; }

    public string Cnp { get; set; } = null!;

    public string? InsuranceCardNumber { get; set; }

    public string? EmergencyContactName { get; set; }

    public string? EmergencyContactPhone { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual ICollection<AssociatedUser> AssociatedUsers { get; set; } = new List<AssociatedUser>();

    public virtual ICollection<PatientAccess> PatientAccesses { get; set; } = new List<PatientAccess>();

    public virtual User User { get; set; } = null!;
}
