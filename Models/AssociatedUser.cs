using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class AssociatedUser
{
    public Guid PrimaryUserId { get; set; }

    public Guid AssociatedUserId { get; set; }

    public string? Relationship { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Patient AssociatedUserNavigation { get; set; } = null!;

    public virtual User PrimaryUser { get; set; } = null!;
}
