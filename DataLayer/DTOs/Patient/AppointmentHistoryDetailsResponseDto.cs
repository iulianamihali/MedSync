using MedSync.DataLayer.DTOs.MedicalRecords;

namespace MedSync.DataLayer.DTOs.Patient
{
    public class AppointmentHistoryDetailsResponseDto
    {
        public String DoctorName { get; set; }
        public String SpecialtyName { get; set; }
        public String ServiceName { get; set; }
        public DateTime DateTime { get; set; }
        public String Address { get; set; }
        public EditMedicalRecordRequestDto DataMedicalRecord { get; set; }
        public bool HasMedicalRefferals { get; set; }
        public bool HasMedicalPrescriptions { get; set; }
    }
}
