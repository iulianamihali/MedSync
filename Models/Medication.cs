namespace MedSync.Models
{
    public class Medication
    {
        public Guid Id { get; set; }
        public Guid PrescriptionId { get; set; }
        public string Name { get; set; }
        public string Strength { get; set; }
        public string Dosage { get; set; }
        public string Frequency { get; set; }
        public string Duration { get; set; }
        public virtual Prescription Prescription { get; set; }
    }
}
