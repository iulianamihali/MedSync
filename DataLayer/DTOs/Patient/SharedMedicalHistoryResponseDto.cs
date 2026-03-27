namespace MedSync.DataLayer.DTOs.Patient
{
    public class SharedMedicalHistoryResponseDto
    {
        public PatientBasicInfoResponseDto BasicInfo { get; set; }
        public List<AppointmentHistoryResponseDto> Appointments { get; set; }
    }
}
