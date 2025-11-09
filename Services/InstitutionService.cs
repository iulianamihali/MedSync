using Azure;
using Azure.Core;
using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NanoidDotNet;
using NanoidDotNet;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
namespace MedSync.Services
{
    public class InstitutionService : IInstitutionService
    {
        private readonly MedSyncContext _context;
        private readonly PasswordHasher<User> _passwordHasher = new();
        private readonly MailerSendService _mailerSendService;

        public InstitutionService(MedSyncContext context, MailerSendService mailerSendService)
        {
            _context = context;
            _mailerSendService = mailerSendService;
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

            var newInstitutionUser = new InstitutionUser
            {
                InstitutionId = newInstitution.Id,
                UserId = newUser.Id,
                CreatedAt = DateTime.Now,
            };
            _context.InstitutionUsers.Add(newInstitutionUser);

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
                  .Include(u => u.Institution)
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

                var success = (await _context.SaveChangesAsync()) > 0;

                if (success) {
                    var json = File.ReadAllText("EmailTemplates.json");
                    using var doc = JsonDocument.Parse(json);
                    if (request.Value)
                    {
                        var template = doc.RootElement.GetProperty("InstitutionApproved");
                        var subject = template.GetProperty("subject").GetString();
                        var html = template.GetProperty("html").GetString()
                            .Replace("{{InstitutionName}}", result.Institution.Name)
                            .Replace("{{AccessCode}}", result.Institution.Code);
                        await _mailerSendService.SendEmailAsync(
                            toEmail: "miuliana959@gmail.com",
                            subject: subject,
                            message: html
                            );
                        
                    }
                    else {
                        var template = doc.RootElement.GetProperty("InstitutionRejected");
                        var subject = template.GetProperty("subject").GetString();
                        var html = template.GetProperty("html").GetString()
                            .Replace("{{InstitutionName}}", result.Institution.Name);
                        await _mailerSendService.SendEmailAsync(
                           toEmail: "miuliana959@gmail.com",
                           subject: template.GetProperty("subject").GetString(),
                           message: html
                           );
                    }
                    return success;
                }

            }
            return false;

        }
        public async Task<PaginationDto<InstitutionsDataTableResponseDto>> GetInstitutionsDataTableAsync(int page)
        {
            var result = _context.InstitutionRequests
                .Include(i => i.User)
                    .ThenInclude(i => i.Address)
                .Include(i => i.Institution)
                .Select(i => new InstitutionsDataTableResponseDto
                {
                    Id = i.Institution.Id,
                    InstitutionName = i.Institution.Name,
                    AdminName = $"{i.User.FirstName} {i.User.LastName}",
                    Address = $"{i.Institution.Address.Country}, {i.Institution.Address.City}, {i.Institution.Address.Street}, {i.Institution.Address.Number}",
                    Country = i.Institution.Address.Country,
                    City = i.Institution.Address.City,
                    StreetAddress = i.Institution.Address.Street,
                    StreetNumber = i.Institution.Address.Number,
                    PostalCode = i.Institution.Address.PostalCode,
                    Email = i.User.Email,
                    PhoneNumber = i.User.PhoneNumber,
                    CreatedAt = i.Institution.CreatedAt,
                    Status = i.Institution.Active

                })
                .AsQueryable();
            var rows = await result
                .Skip(page * 9)
                .Take(9)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
            var total = await result.CountAsync();
            return new PaginationDto<InstitutionsDataTableResponseDto>
            {
                Rows = rows,
                TotalCount = total,
            };
        }

        public async Task<bool> UpdateInstitutionsInfoAsync(UpdateInstitutionsInfoDto request)
        {
            var result = await _context.Institutions
                    .Include(i => i.Address)
                    .Where(i => i.Id == request.Id)
                .FirstOrDefaultAsync();
            if(result != null)
            {
                result.Name = request.InstitutionName;
                result.Address.Country = request.Country;
                result.Address.City = request.City;
                result.Address.Street = request.StreetAddress;
                result.Address.Number = request.StreetNumber;
                result.Address.PostalCode = request.PostalCode;
                result.Active = request.Status;
                _context.Institutions.Update(result);
            }
            return (await _context.SaveChangesAsync()) > 0;
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
