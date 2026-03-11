namespace MedSync.DataLayer.DTOs.Doctor
{
    public class DoctorPreview
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public double Rating { get; set; }
        public List<String> Specialties { get; set; }
    }
}
