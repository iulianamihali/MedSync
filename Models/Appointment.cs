using MedSync.DataLayer.Enums;
using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class Appointment
{
    public Guid Id { get; set; }

    public Guid InstitutionServiceId { get; set; }

    public Guid PatientId { get; set; }

    public Guid DoctorId { get; set; }
    public Guid InstitutionId { get; set; }

    public string? ReferralCode { get; set; }
    public DateTime StartDateTime { get; set; }

    public DateTime EndDateTime { get; set; }
    public decimal TotalPrice { get; set; }
    public AppointmentStatusEnumType Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? CanceledAt { get; set; }

    public virtual Doctor Doctor { get; set; } = null!;

    public virtual Patient Patient { get; set; } = null!;
    public virtual Institution Institution { get; set; } = null!;

    public virtual InstitutionService InstitutionService { get; set; }
}
