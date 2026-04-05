using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class Doctor
{
    public Guid UserId { get; set; }
    public int YearsOfExperience { get; set; }

    public string MedicalLicenseNumber { get; set; } = null!;

    public string? UniversityName { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual User User { get; set; } = null!;
    public virtual ICollection<DoctorSpecialty> DoctorSpecialties { get; set; } =
        new List<DoctorSpecialty>();
}
