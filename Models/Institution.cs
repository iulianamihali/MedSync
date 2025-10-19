using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class Institution
{
    public Guid Id { get; set; }

    public int Type { get; set; }

    public string Name { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid AddressId { get; set; }

    public virtual Address Address { get; set; } = null!;

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual ICollection<InstitutionUser> InstitutionUsers { get; set; } = new List<InstitutionUser>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<UserSchedule> UserSchedules { get; set; } = new List<UserSchedule>();
}
