using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using System.Text;
using MedSync.DataLayer.DTOs.Auth;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace MedSync.Services
{
    public class AuthService
    {
        private readonly IConfiguration _configuration;
        private readonly MedSyncContext _context;
        private readonly MailerSendService _mailerSendService;
        private readonly PasswordHasher<User> _passwordHasher = new();

        public AuthService(
            MedSyncContext context,
            IConfiguration configuration,
            MailerSendService mailerSendService
        )
        {
            _context = context;
            _configuration = configuration;
            _mailerSendService = mailerSendService;
        }

        public string ValidateLogin(LoginRequestDto request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (user == null)
            {
                return null;
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return null;
            }
            var insId = _context
                .InstitutionUsers.Include(i => i.Institution)
                .Where(i => i.UserId == user.Id)
                .Select(i => i.InstitutionId)
                .FirstOrDefault();

            var token = GenerateJwtToken(user, insId);
            return token;
        }

        private string GenerateJwtToken(User user, Guid? institutionId)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("name", $"{user.FirstName} {user.LastName}".Trim()),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("ins", $"{institutionId}"),
            };

            var securityKey = new SymmetricSecurityKey(
                Convert.FromBase64String(_configuration["Jwt:Key"]!)
            );
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(48),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string? RegisterUser(SignupRequestDto request)
        {
            Guid? institutionId = null;
            if (request.Role == UserType.Doctor)
            {
                institutionId = _context
                    .Institutions.FirstOrDefault(x => x.Code == request.DoctorData.InstitutionCode)
                    ?.Id;
                if (institutionId == null)
                    return null;
            }
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Role = request.Role,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Gender = request.Gender,
                DateOfBirth = request.DateOfBirth,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                AddressId = null,
            };
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, request.Password);
            _context.Users.Add(newUser);
            if (request.Role == UserType.Patient)
            {
                var patient = new Patient
                {
                    UserId = newUser.Id,
                    Cnp = request.PatientData.Cnp,
                    InsuranceCardNumber = request.PatientData.InsuranceNumber,
                    EmergencyContactName = request.PatientData.EmergencyContactName,
                    EmergencyContactPhone = request.PatientData.EmergencyContactPhone,
                };
                _context.Patients.Add(patient);
            }
            else if (request.Role == UserType.Doctor)
            {
                var doctor = new Doctor
                {
                    UserId = newUser.Id,
                    YearsOfExperience = request.DoctorData.YearsOfExperience,
                    MedicalLicenseNumber = request.DoctorData.LicenseNumber,
                    UniversityName = request.DoctorData.UniversityName,
                };

                _context.Doctors.Add(doctor);
                _context.InstitutionUsers.Add(
                    new InstitutionUser
                    {
                        InstitutionId = institutionId.Value,
                        UserId = doctor.UserId,
                        CreatedAt = DateTime.UtcNow,
                    }
                );
                var newDoctorRequest = new DoctorRequests
                {
                    Id = Guid.NewGuid(),
                    UserId = newUser.Id,
                    InstitutionId = institutionId.Value,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = null,
                    Status = DoctorRequestsStatusEnumType.Pending,
                };
                _context.DoctorRequests.Add(newDoctorRequest);
            }
            _context.SaveChanges();

            var token = GenerateJwtToken(newUser, institutionId);
            return token;
        }

        public async Task<string?> GenerateResetTokenAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return null; 
            }

            string securityStamp = user.PasswordHash.Length >= 10
                ? user.PasswordHash.Substring(0, 10)
                : user.PasswordHash;

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("pwd_stamp", securityStamp) 
            };

            var securityKey = new SymmetricSecurityKey(
               Convert.FromBase64String(_configuration["Jwt:Key"]!)
            );
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public bool ValidateResetToken(string token, out string email, out string tokenStamp)
        {
            email = string.Empty;
            tokenStamp = string.Empty;

            var handler = new JwtSecurityTokenHandler();
            var securityKey = new SymmetricSecurityKey(
               Convert.FromBase64String(_configuration["Jwt:Key"]!)
            );

            try
            {
                handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = securityKey,
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;

                email = jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value;
                tokenStamp = jwtToken.Claims.First(c => c.Type == "pwd_stamp").Value;

                return true;
            }
            catch
            {
                return false; 
            }
        }

        public async Task<bool> RequestResetPasswordAsync(string email)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (existingUser == null)
            {
                return false;
            }

            var generatedToken = await GenerateResetTokenAsync(existingUser.Email);
            if (generatedToken == null)
                return false;

            var frontendBaseUrl = _configuration["FrontendSettings:BaseUrl"];
            var resetPath = "/reset-password";
            var resetLink =
                $"{frontendBaseUrl?.TrimEnd('/')}{resetPath}?token={Uri.EscapeDataString(generatedToken)}";

            var json = File.ReadAllText("EmailTemplates.json");
            using var doc = JsonDocument.Parse(json);

            var hasTemplate = doc.RootElement.TryGetProperty("PasswordReset", out var template);

            var subject = hasTemplate
                ? template.GetProperty("subject").GetString()!
                : "Reset your MedSync password";

            var html = hasTemplate
                ? template.GetProperty("html").GetString()!.Replace("{{ResetLink}}", resetLink)
                : $"<p>Hello,</p><p>Use the link below to reset your password:</p><p><a href='{resetLink}'>{resetLink}</a></p><p>This link expires in 1 hour.</p>";

            return await _mailerSendService.SendEmailAsync(existingUser.Email, subject, html);
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            if (!ValidateResetToken(request.Token, out string email, out string tokenStamp))
            {
                return false; 
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (existingUser == null)
            {
                return false;
            }

            string expectedStamp = existingUser.PasswordHash.Length >= 10
                ? existingUser.PasswordHash.Substring(0, 10)
                : existingUser.PasswordHash;

            if (tokenStamp != expectedStamp)
            {
                return false; 
            }

           
            existingUser.PasswordHash = _passwordHasher.HashPassword(existingUser, request.Password);

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
