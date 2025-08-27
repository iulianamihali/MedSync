using System;
using System.Collections.Generic;

namespace MedSync.Models;

public partial class Address
{
    public Guid AddressId { get; set; }

    public string Country { get; set; } = null!;

    public string City { get; set; } = null!;

    public string Street { get; set; } = null!;

    public string Number { get; set; } = null!;

    public string PostalCode { get; set; } = null!;

    public virtual ICollection<Institution> Institutions { get; set; } = new List<Institution>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
