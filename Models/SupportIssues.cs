using MedSync.DataLayer.Enums;

namespace MedSync.Models
{
    public class SupportIssues
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public SupportIssuesEnumType Type { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool Active { get; set; }
        public StatusSupportEnumType Status { get; set; }
        public virtual User User { get; set; }
    }
}
