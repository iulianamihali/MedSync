using MedSync.DataLayer.DTOs.GlobalData;

namespace MedSync.DataLayer.DTOs.Doctor
{
    public class DoctorInfoTabResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public List<SpecialtyDto> DoctorSpecialties { get; set; }
        public double Rating { get; set; }
        public int TotalReviews { get; set; }
    }
}
