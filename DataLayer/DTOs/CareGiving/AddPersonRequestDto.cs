using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.CareGiving
{
    public class AddPersonRequestDto
    {
        public Guid OwnerId { get; set; }
        public String FirstName { get; set; }
        public String LastName { get; set; }
        public String Cnp { get; set; }
        public String DateOfBirth { get; set; }
        public RelationshipType Relationship { get; set; }
    }
}
