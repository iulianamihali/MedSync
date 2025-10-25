using Azure.Core;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NanoidDotNet;
using NanoidDotNet;
using System.Text.RegularExpressions;
namespace MedSync.Services
{
    public class InstitutionService : IInstitutionService
    {
        private readonly MedSyncContext _context;
        private readonly PasswordHasher<User> _passwordHasher = new();

        public InstitutionService(MedSyncContext context)
        {
            _context = context;
        }
        public async Task<bool> RegisterInstitutionAsync(InstitutionRequestDto requestDto)
        {
            var newAddress = new Address
            {
                Id = Guid.NewGuid(),
                Country = requestDto.Country,
                City = requestDto.City,
                Street = requestDto.StreetAddress,
                Number = requestDto.StreetNumber,
                PostalCode = requestDto.PostalCode,
            };
            _context.Addresses.Add(newAddress);

            var newInstitution = new Institution
            {
                Id = Guid.NewGuid(),
                Name = requestDto.InstitutionName,
                TaxIdentificationNumber = requestDto.TaxIdentificationNumber,
                PhoneNumber = requestDto.PhoneNumber,
                CreatedAt = DateTime.UtcNow,
                AddressId = newAddress.Id,
                Code = GenerateInstitutionCode(requestDto.InstitutionName),
                Active = false,
            };
            _context.Institutions.Add(newInstitution);

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Role = UserType.LocalAdmin,
                FirstName = requestDto.FirstName,
                LastName = requestDto.LastName,
                Gender = null,
                DateOfBirth = null,
                PhoneNumber = requestDto.PhoneNumber,
                Email = requestDto.Email,
                CreatedAt = DateTime.UtcNow,
                IsActive = false,
                AddressId = newAddress.Id,
            };
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, requestDto.Password);
            _context.Users.Add(newUser);

            var newInstitutionRequest = new InstitutionRequests
            {
                Id = Guid.NewGuid(),
                UserId = newUser.Id,
                InstitutionId = newInstitution.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null,
                Status = InstitutionRequestsStatusEnumType.Pending,

            };
            _context.InstitutionRequests.Add(newInstitutionRequest);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<int> CountInstitutionRequestsAsync()
        {
            var result = await _context.InstitutionRequests
                .Where(instReq => instReq.Status == InstitutionRequestsStatusEnumType.Pending)
                .CountAsync();
            return result;
        }

        public async Task<List<InstitutionReqPopUpResponseDto>> GetInstitutionRequestDetailsAsync()
        {
            var result = await _context.InstitutionRequests
                .AsNoTracking()
                .Where(u => u.Status == InstitutionRequestsStatusEnumType.Pending)
                .Include(u => u.User)
                .Include(u => u.Institution).ThenInclude(u => u.Address)
                .Select(u => new InstitutionReqPopUpResponseDto
                {
                    Id = u.Id,
                    Name = u.Institution.Name,
                    TaxIdentificationNumber = u.Institution.TaxIdentificationNumber,
                    PhoneNumber = u.User.PhoneNumber,
                    Email = u.User.Email,
                    Country = u.Institution.Address.Country,
                    City = u.Institution.Address.City,
                    StreetAddress = u.Institution.Address.Street,
                    StreetNumber = u.Institution.Address.Number,
                    CreatedAt = u.CreatedAt
                })
                .OrderBy(u => u.CreatedAt)
                .ToListAsync();
            return result;
                
        }

        public async Task<bool> UpdateStatusInstitutionRequestAsync(UpdateInstitutionRequestDto request)
        {
            var result = await _context.InstitutionRequests
                  .Where(u => u.Id == request.Id)
                  .FirstOrDefaultAsync();
            if (result != null)
            {
                if (request.Value)
                {
                    result.Status = InstitutionRequestsStatusEnumType.Approved;
                    result.UpdatedAt = DateTime.UtcNow;
                    _context.InstitutionRequests.Update(result);
                    var institution = await _context.Institutions.FirstOrDefaultAsync(x => x.Id == result.InstitutionId);
                    if (institution != null)
                    {
                        institution.Active = true;
                        _context.Institutions.Update(institution);
                    }

                    var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == result.UserId);
                    if (user != null)
                    {
                        user.IsActive = true;
                        _context.Users.Update(user);
                    }

                }
                else
                {
                    result.Status = InstitutionRequestsStatusEnumType.Rejected;
                    result.UpdatedAt = DateTime.UtcNow;
                    _context.InstitutionRequests.Update(result);

                }

                return (await _context.SaveChangesAsync()) > 0;

            }
            return false;

        }

        private string GenerateInstitutionCode (string institutionName)
        {
            var cleanName = Regex.Replace(institutionName.ToUpper(), @"[^A-Z0-9]", "");
            var prefix = cleanName.Length >= 3 ? cleanName.Substring(0, 3) : cleanName;
            const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var randomPart = Nanoid.Generate(alphabet, 5);
            return $"{prefix}-{randomPart}";
        }
    }
}
