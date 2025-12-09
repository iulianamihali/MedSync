using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class Institution
{
    public Guid Id { get; set; }

    public string Code { get; set; }

    public string Name { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid AddressId { get; set; }
    public bool Active { get; set; }
    public string TaxIdentificationNumber { get; set; }
    public virtual Address Address { get; set; } = null!;

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual ICollection<InstitutionUser> InstitutionUsers { get; set; } = new List<InstitutionUser>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<UserSchedule> UserSchedules { get; set; } = new List<UserSchedule>();
    public virtual ICollection<InstitutionRequests> InstitutionRequests { get; set; } = new List<InstitutionRequests>();
    public virtual ICollection<DoctorRequests> DoctorRequests { get; set; } = new List<DoctorRequests>();
    public virtual ICollection<InstitutionService> InstitutionServices { get; set; }
}
