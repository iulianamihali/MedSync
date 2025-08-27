using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class User
{
    public Guid UserId { get; set; }

    public int Role { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Gender { get; set; } 

    public DateOnly? DateOfBirth { get; set; }

    public string? PhoneNumber { get; set; } 

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; }

    public Guid? AddressId { get; set; }

    public virtual Address? Address { get; set; }

    public virtual ICollection<AssociatedUser> AssociatedUsers { get; set; } = new List<AssociatedUser>();

    public virtual Doctor? Doctor { get; set; }

    public virtual ICollection<InstitutionUser> InstitutionUsers { get; set; } = new List<InstitutionUser>();

    public virtual Patient? Patient { get; set; }

    public virtual ICollection<PatientAccess> PatientAccesses { get; set; } = new List<PatientAccess>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<UserSchedule> UserScheduleCreatedByUsers { get; set; } = new List<UserSchedule>();

    public virtual ICollection<UserSchedule> UserScheduleUsers { get; set; } = new List<UserSchedule>();
}
