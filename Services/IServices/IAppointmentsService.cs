using MedSync.DataLayer.DTOs.Appointments;

namespace MedSync.Services.IServices
{
    public interface IAppointmentsService
    {
       Task<List<CalendarAppointmentsDto>> GetCalendarAppointmentsAsync(CalendarAppointmentsRequestDto request);
       Task<bool> EditInfoAppointment (EditInfoAppointmentRequest request);
    }
}
