using MedSync.DataLayer.DTOs.GlobalData;
using MedSync.DataLayer.DTOs.Institution;

namespace MedSync.DataLayer.DTOs.Doctor
{
    public class AvailabilityDoctorsResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public List<SpecialtyDto> DoctorSpecialties { get; set; }
        public double Rating { get; set; }
        public int TotalReviews { get; set; }
        public List<AvailableSlotDto> SlotsAvailable { get; set; }
    }
}
