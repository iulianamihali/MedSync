using MedSync.DataLayer.Enums;

namespace MedSync.Models
{
    public class InstitutionRequests
    {
        public Guid Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public InstitutionRequestsStatusEnumType Status { get; set; }
        public Guid UserId { get; set; }
        public Guid InstitutionId { get; set; }
        public virtual User User { get; set; }
        public virtual Institution Institution { get; set; }


    }
}
