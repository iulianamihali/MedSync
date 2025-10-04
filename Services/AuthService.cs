using MedSync.DataLayer.DTOs.Auth;
using MedSync.Models;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MedSync.DataLayer.Enums;
using Microsoft.AspNetCore.Mvc;
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

        public LoginResponseDto ValidateLogin(LoginRequestDto request)
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
            var token = GenerateJwtToken(user);
            return new LoginResponseDto
            {
                Token = token,
                UserId = user.UserId,
                Role = user.Role,
                Email = user.Email,
                UserName = $"{user.FirstName} {user.LastName}"
            };
        }

        private String GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("name", $"{user.FirstName} {user.LastName}".Trim()),
                new Claim(ClaimTypes.Role, user.Role.ToString()),

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

        public LoginResponseDto RegisterUser(SignupRequestDto request)
        {
            var newUser = new User
            {
                UserId = Guid.NewGuid(),
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
                    UserId = newUser.UserId,
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
                    UserId = newUser.UserId,
                    Specialization = request.DoctorData.Specialization,
                    YearsOfExperience = request.DoctorData.YearsOfExperience,
                    MedicalLicenseNumber = request.DoctorData.LicenseNumber,
                    UniversityName = request.DoctorData.UniversityName,
                };
                _context.Doctors.Add(doctor);
            }
            _context.SaveChanges();

            var token = GenerateJwtToken(newUser);
            return new LoginResponseDto
            {
                Token = token,
                UserId = newUser.UserId,
                Role = newUser.Role,
                Email = newUser.Email,
                UserName = $"{newUser.FirstName} {newUser.LastName}"
            };

            
        }
    }

}

