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

        public async Task<PaginationDto<UsersDataTableResponseDto>> GetDataTableUsersAsync(
            int page,
            UserType userType
        )
        {
            var result = _context
                .Users.Where(i => i.Role == userType)
                .Include(i => i.InstitutionUsers)
                    .ThenInclude(i => i.Institution)
                .Select(i => new UsersDataTableResponseDto
                {
                    Id = i.Id,
                    UserName = $"{i.FirstName} {i.LastName}",
                    Role = i.Role,
                    InstitutionName = string.Join(
                        ", ",
                        i.InstitutionUsers.Select(x => x.Institution.Name)
                    ),
                    CreatedAt = i.CreatedAt,
                    Status = i.IsActive,
                })
                .AsQueryable();

            var rows = await result
                .Skip(page * 9)
                .Take(9)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
            var total = await result.CountAsync();
            return new PaginationDto<UsersDataTableResponseDto> { Rows = rows, TotalCount = total };
        }

        public async Task<UserSettingsDataResponseDto> GetUserSettingsDataAsync(Guid id)
        {
            var result = await _context
                .Users.Where(i => i.Id == id)
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
                    PostalCode = i.Address.PostalCode,
                })
                .FirstOrDefaultAsync();
            return result;
        }

        public async Task<bool> EditInfoUsersAsync(UserSettingsDataResponseDto request)
        {
            var result = await _context
                .Users.Where(i => i.Id == request.Id)
                .Include(i => i.Address)
                .FirstOrDefaultAsync();
            result.FirstName = request.FirstName;
            result.LastName = request.LastName;
            result.PhoneNumber = request.PhoneNumber;
            result.Email = request.Email;
            if (result.Role == UserType.Patient || result.Role == UserType.Doctor)
            {
                if (result.Address == null)
                {
                    result.Address = new Address
                    {
                        Id = Guid.NewGuid(),
                        Country = request.Country,
                        City = request.City,
                        Street = request.StreetAddress,
                        Number = request.StreetNumber,
                        PostalCode = request.PostalCode,
                    };

                    _context.Addresses.Add(result.Address);
                }
                else
                {
                    result.Address.Country = request.Country;
                    result.Address.City = request.City;
                    result.Address.Street = request.StreetAddress;
                    result.Address.Number = request.StreetNumber;
                    result.Address.PostalCode = request.PostalCode;
                }
            }
            _context.Users.Update(result);
            return (await _context.SaveChangesAsync()) > 0;
        }

        public async Task<bool> UpdateUserStatusAsync(UpdateUserStatusRequestDto request)
        {
            var result = await _context.Users.Where(i => i.Id == request.Id).FirstOrDefaultAsync();
            if (result != null)
            {
                result.IsActive = request.Value;
                _context.Users.Update(result);
            }
            return (await _context.SaveChangesAsync()) > 0;
        }
    }
}
