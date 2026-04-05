using MedSync.Models;

namespace MedSync.DataLayer.DTOs.GlobalData
{
    public class SpecialtyDto
    {
        public SpecialtyDto() { }

        public SpecialtyDto(Specialty specialty)
        {
            Id = specialty.Id;
            Name = specialty.Name;
        }

        public Guid Id { get; set; }
        public string Name { get; set; }
    }
}
