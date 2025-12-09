namespace MedSync.Models
{
    public class Service
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public virtual ICollection<InstitutionService> InstitutionServices { get; set; }
    }
}
