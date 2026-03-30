using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.SupportIssue
{
    public class SupportIssueResponseDto
    {
        public Guid Id { get; set; }
        public UserType UserRole { get; set; }
        public SupportIssuesEnumType Type { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public StatusSupportEnumType Status { get; set; }
    }
}
