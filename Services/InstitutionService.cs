using MedSync.DataLayer.DTOs.Institution;
using MedSync.Models;
using MedSync.Services.IServices;
using NanoidDotNet;
using System.Text.RegularExpressions;
using NanoidDotNet;
using MedSync.DataLayer.Enums;
namespace MedSync.Services
{
    public class InstitutionService : IInstitutionService
    {
        private readonly MedSyncContext _context;
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
                PasswordHash = requestDto.Password,
                CreatedAt = DateTime.UtcNow,
                IsActive = false,
                AddressId = null,
            };
            _context.Users.Add(newUser);
            var result = await _context.SaveChangesAsync();
            return result > 0;
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
