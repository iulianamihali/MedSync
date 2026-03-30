using MedSync.DataLayer.Enums;

namespace MedSync.DataLayer.DTOs.SupportIssue
{
    public class AddSupportIssueRequestDto
    {
        public Guid UserId { get; set; }
        public SupportIssuesEnumType IssueType { get; set; }
        public string Description { get; set; }
    }
}
