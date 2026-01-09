namespace MedSync.DataLayer.DTOs.Institution
{
    public class EditDataServiceRequestDto
    {
        public Guid InstitutionServiceId { get; set; }
        public decimal Price { get; set; }
        public int Duration { get; set; }
    }
}
