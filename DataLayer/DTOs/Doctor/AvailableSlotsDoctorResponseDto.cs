using MedSync.DataLayer.DTOs.Institution;

namespace MedSync.DataLayer.DTOs.Doctor
{
    public class AvailableSlotsDoctorResponseDto
    {
        public Guid DoctorId { get; set; }
        public List<AvailableSlotDto> SlotsAvailable { get; set; }

    }
}
