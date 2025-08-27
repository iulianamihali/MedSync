using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class InstitutionUser
{
    public Guid InstitutionId { get; set; }

    public Guid UserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Institution Institution { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
