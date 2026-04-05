using MedSync.DataLayer.Enums;
using Microsoft.EntityFrameworkCore.ValueGeneration;

namespace MedSync.DataLayer.DTOs.Appointments
{
    public class EditInfoAppointmentRequest
    {
        public Guid Id { get; set; }
        public decimal TotalPrice { get; set; }
        public AppointmentStatusEnumType Status { get; set; }
    }
}
