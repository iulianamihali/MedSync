namespace MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard
{
    public class DashboardFilterRequestDto
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public Guid?  InstitutionId { get; set; }
        public Guid? DoctorId { get; set; }
    }
}
