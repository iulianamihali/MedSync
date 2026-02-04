namespace MedSync.DataLayer.DTOs.Appointments
{
    public class CalendarAppointmentsRequestDto
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public Guid InstitutionId { get; set; }
        public Guid? DoctorId { get; set; }

    }
}
