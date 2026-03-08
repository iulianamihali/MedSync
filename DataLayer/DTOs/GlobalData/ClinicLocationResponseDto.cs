namespace MedSync.DataLayer.DTOs.GlobalData
{
    public class ClinicLocationResponseDto
    {
        public Guid Id { get; set; }
        public string InstitutionName { get; set; }
        public List<string> InstitutionSpecialties { get; set; }
        public string FullAddress { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public double Rating { get; set; }
        public int TotalRatings { get; set; }
    }
}
