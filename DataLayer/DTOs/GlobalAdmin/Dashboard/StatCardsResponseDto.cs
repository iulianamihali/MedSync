using System.Text.Json.Serialization;

namespace MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard
{
    public class StatCardDto
    {
        public string Title { get; set; }
        public int Value { get; set; }
        public string Trend { get; set; }
        public int TrendValue { get; set; }
        public List<ChartStatPointDto> ChartData { get; set; }
    }

    public class StatCardsResponseDto
    {
        public StatCardDto Patients { get; set; }
        public StatCardDto Doctors { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public StatCardDto Institutions { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public StatCardDto Appointments { get; set; }
    }
}
