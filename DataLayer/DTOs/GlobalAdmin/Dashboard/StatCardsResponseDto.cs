namespace MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard
{
    public class StatCardDto
    {
        public string Title { get; set; }
        public int Value { get; set; }
        public string Trend { get; set; }
        public List<ChartStatPointDto> ChartData { get; set; }
    }
    public class StatCardsResponseDto
    {
       public StatCardDto Patients { get; set; } = new StatCardDto();
       public StatCardDto Doctors { get; set; } = new StatCardDto();
       public StatCardDto Institutions { get; set; } = new StatCardDto();
    }
}
