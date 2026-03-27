namespace MedSync.DataLayer.DTOs.Patient
{
    public class ActiveLinkStatusResponseDto
    {
        public string Token { get; set; }
        public int RemainingSeconds { get; set; }
    }
}
