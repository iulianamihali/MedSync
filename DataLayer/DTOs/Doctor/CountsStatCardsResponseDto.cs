namespace MedSync.DataLayer.DTOs.Doctor
{
    public class CountsStatCardsResponseDto
    {
        public int TotalPatientsWithAppointments { get; set; }
        public int TotalAppointmentsByPeriod { get; set; }
        public int TotalReferralsByAppointment { get; set; }
    }
}
