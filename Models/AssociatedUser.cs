using MedSync.DataLayer.Enums;
using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class AssociatedUser
{
    public Guid PrimaryUserId { get; set; }

    public Guid CareUnregisteredPatientId { get; set; }

    public RelationshipType Relationship { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual UnregisteredPatient CareUnregisteredPatient { get; set; } = null!;

    public virtual User PrimaryUser { get; set; } = null!;
}
