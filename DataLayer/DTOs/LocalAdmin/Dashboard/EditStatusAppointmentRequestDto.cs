using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.LocalAdmin.Dashboard
{
    public class EditStatusAppointmentRequestDto
    {
        public Guid AppointmentId { get; set; }
        public AppointmentStatusEnumType Status {  get; set; }
    }
}
