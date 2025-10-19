using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class UserSchedule
{
    public Guid Id { get; set; }

    public int DayOfWeek { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public Guid UserId { get; set; }

    public Guid InstitutionId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public virtual User CreatedByUser { get; set; } = null!;

    public virtual Institution Institution { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
