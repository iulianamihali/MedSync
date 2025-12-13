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

    public virtual ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual User User { get; set; } = null!;
    public virtual ICollection<DoctorSpecialty> DoctorSpecialties { get; set; } = new List<DoctorSpecialty>();
}
