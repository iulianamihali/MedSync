namespace MedSync.DataLayer.DTOs.LocalAdmin.Dashboard
{
    public class CountsStatCardsResponseDto
    {
        public int AppointmentsCount { get; set; }
        public int DoctorsCount { get; set; }
        public int CanceledAppointmentsCount { get; set; }
        public int AppointmentsWithReferralCount { get; set; }
    }
}
