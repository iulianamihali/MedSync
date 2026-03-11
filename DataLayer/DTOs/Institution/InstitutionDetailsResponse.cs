using MedSync.DataLayer.DTOs.Doctor;

namespace MedSync.DataLayer.DTOs.Institution
{
    public class InstitutionDetailsResponse
    {
        public Guid InstitutionId { get; set; }
        public string InstitutionName { get; set; }
        public double Rating { get; set; }
        public int TotalReviews { get; set; }
        public string Address { get; set; }
        public List<DoctorPreview> Doctors { get; set; }
    }
}
