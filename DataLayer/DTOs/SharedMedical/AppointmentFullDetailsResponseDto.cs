using MedSync.DataLayer.DTOs.MedicalPrescriptions;
using MedSync.DataLayer.DTOs.MedicalReferrals;
using MedSync.DataLayer.DTOs.Patient;

namespace MedSync.DataLayer.DTOs.SharedMedical
{
    public class AppointmentFullDetailsResponseDto
    {
        public AppointmentHistoryDetailsResponseDto AppointmentDetails { get; set; }
        public List<GetAppointmentPrescriptionsResponseDto> Prescriptions { get; set; }
        public List<GetAppointmentReferralsResponseDto> Refferals { get; set; }
    }
}
