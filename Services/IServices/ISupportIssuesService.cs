using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.SupportIssue;
using MedSync.DataLayer.Enums;

namespace MedSync.Services.IServices
{
    public interface ISupportIssuesService
    {
        public Task<bool> AddSupportIssueAsync(AddSupportIssueRequestDto request);
        Task<PaginationDto<SupportIssueResponseDto>> GetSupportIssuesAsync(int page);
        Task<bool> UpdateSupportIssueStatusAsync(Guid id, StatusSupportEnumType status);
    }
}
