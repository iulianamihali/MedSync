using MedSync.DataLayer.DTOs.Auth;
using MedSync.Models;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MedSync.DataLayer.Enums;
using Microsoft.EntityFrameworkCore;
namespace MedSync.Services
{
    public class AuthService
    {
        private readonly IConfiguration _configuration;
        private readonly MedSyncContext _context;
        private readonly PasswordHasher<User> _passwordHasher = new();
        public AuthService(MedSyncContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public string ValidateLogin(LoginRequestDto request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (user == null)
            {
                return null;
            }
           
            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return null;
            }
            var insId = _context.InstitutionUsers
                .Include(i => i.Institution)
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
                new Claim("ins", $"{institutionId}")

            };

            var securityKey = new SymmetricSecurityKey(
                 Convert.FromBase64String(_configuration["Jwt:Key"]!)
            );
            var credentials = new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256
            );
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
            if(request.Role == UserType.Doctor)
            {
                institutionId = _context.Institutions.FirstOrDefault(x => x.Code == request.DoctorData.InstitutionCode)?.Id;
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
            else if (request.Role == UserType.Doctor) {
                var doctor = new Doctor
                {
                    UserId = newUser.Id,
                    Specialization = request.DoctorData.Specialization,
                    YearsOfExperience = request.DoctorData.YearsOfExperience,
                    MedicalLicenseNumber = request.DoctorData.LicenseNumber,
                    UniversityName = request.DoctorData.UniversityName,
                };
                _context.Doctors.Add(doctor);
                _context.InstitutionUsers.Add(new InstitutionUser
                {
                    InstitutionId = institutionId.Value,
                    UserId = doctor.UserId,
                    CreatedAt = DateTime.UtcNow,
                });
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
    }

}

