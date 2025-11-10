using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.DataLayer.DTOs.User;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class UserService : IUserService
    {
        private readonly MedSyncContext _context;
        public UserService(MedSyncContext context)
        {
            _context = context;
        }
        public async Task<PaginationDto<UsersDataTableResponseDto>> GetDataTableUsersAsync(int page, UserType userType)
        {
            var result = _context.Users
                .Where(i => i.Role == userType)
                .Include(i => i.InstitutionUsers)
                    .ThenInclude(i => i.Institution)
                .Select(i => new UsersDataTableResponseDto
                {
                    Id = i.Id,
                    UserName = $"{i.FirstName},{i.LastName}",
                    Role = i.Role,
                    InstitutionName = string.Join(", ", i.InstitutionUsers
                        .Select(x => x.Institution.Name)),
                    CreatedAt = i.CreatedAt,
                    Status = i.IsActive

                })
                .AsQueryable();

            var rows = await result
                .Skip(page * 9)
                .Take(9)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
            var total = await result.CountAsync();
            return new PaginationDto<UsersDataTableResponseDto>
            {
                Rows = rows,
                TotalCount = total,
            };

        }

        public async Task<UserSettingsDataResponseDto> GetUserSettingsDataAsync(Guid id)
        {
            var result = await _context.Users
                .Where(i => i.Id == id)
                .Include(i => i.Address)
                .Select(i => new UserSettingsDataResponseDto
                {
                    Id = i.Id,
                    FirstName = i.FirstName,
                    LastName = i.LastName,
                    PhoneNumber = i.PhoneNumber,
                    Email = i.Email,
                    Country = i.Address.Country,
                    City = i.Address.City,
                    StreetAddress = i.Address.Street,
                    StreetNumber = i.Address.Number,
                    PostalCode = i.Address.PostalCode
                })
                .FirstOrDefaultAsync();
            return result;
        }
    }
}
