using MedSync.DataLayer.DTOs.GlobalData;

namespace MedSync.DataLayer.DTOs.Doctor
{
    public class DoctorInfoTabResponse
    {
        public DoctorInfoTabResponse() { }
        public DoctorInfoTabResponse(DoctorInfoTabResponse copy, List<SpecialtyDto> specialties)
        {
            Id = copy.Id;
            Name = copy.Name;
            DoctorSpecialties = specialties;
            Rating = copy.Rating;
            TotalReviews = copy.TotalReviews;
        }
        public Guid Id { get; set; }
        public string Name { get; set; }
        public List<SpecialtyDto> DoctorSpecialties { get; set; }
        public double Rating { get; set; }
        public int TotalReviews { get; set; }
    }
}
