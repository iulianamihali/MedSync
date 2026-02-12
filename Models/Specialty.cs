namespace MedSync.Models
{
    public class Specialty
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public virtual ICollection<InstitutionService> InstitutionServices { get; set; } = new List<InstitutionService>();
        public virtual ICollection<MedicalReferral> MedicalReferrals { get; set; } = new List<MedicalReferral>();

    }
}
