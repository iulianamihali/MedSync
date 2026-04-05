using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.SupportIssue;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class SupportIssuesService : ISupportIssuesService
    {
        private readonly MedSyncContext _context;

        public SupportIssuesService(MedSyncContext context)
        {
            _context = context;
        }

        public async Task<bool> AddSupportIssueAsync(AddSupportIssueRequestDto request)
        {
            var supportIssue = new SupportIssues
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Type = request.IssueType,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow,
                Active = true,
                Status = StatusSupportEnumType.Pending,
            };
            _context.SupportIssues.Add(supportIssue);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<PaginationDto<SupportIssueResponseDto>> GetSupportIssuesAsync(int page)
        {
            var query = _context
                .SupportIssues.Include(s => s.User)
                .Where(s => s.Active)
                .OrderByDescending(s => s.CreatedAt);

            var totalCount = await query.CountAsync();
            var rows = await query
                .Skip(page * 9)
                .Take(9)
                .Select(s => new SupportIssueResponseDto
                {
                    Id = s.Id,
                    UserRole = s.User.Role,
                    Type = s.Type,
                    Description = s.Description,
                    CreatedAt = s.CreatedAt,
                    Status = s.Status,
                })
                .ToListAsync();

            return new PaginationDto<SupportIssueResponseDto>
            {
                Rows = rows,
                TotalCount = totalCount,
            };
        }

        public async Task<bool> UpdateSupportIssueStatusAsync(Guid id, StatusSupportEnumType status)
        {
            var issue = await _context.SupportIssues.FindAsync(id);
            if (issue == null)
                return false;
            issue.Status = status;
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
