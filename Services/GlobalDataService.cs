using MedSync.DataLayer.DTOs.GlobalData;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Metrics;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace MedSync.Services
{
    public class GlobalDataService : IGlobalDataService
    {
        private readonly MedSyncContext _context;
        public GlobalDataService(MedSyncContext context)
        {
            _context = context;
        }
        public async Task<List<SpecialtyDto>> GetSpecialties()
        {

            var specialties = await _context.Specialties
                .Select(x => new SpecialtyDto(x))
               .ToListAsync();
            return specialties;
            
        }
        public async Task<List<ServiceSelectDto>> GetServices()
        {
            var services = await _context.Services
                .Select(x => new ServiceSelectDto
                {
                    Id = x.Id,
                    Name = x.Name,
                }
                )
                .ToListAsync();
            return services;
        }
        public async Task<List<SpecialtyDto>> GetInstitutionSpecialties(string codeInstitution)
        {
            var institutionId = await _context.Institutions
                .Where(c => c.Code == codeInstitution)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();
            var result = await _context.InstitutionServices
                .Where(i => i.InstitutionId == institutionId)
                .Select(x => new SpecialtyDto
                {
                    Id = x.Specialty.Id,
                    Name = x.Specialty.Name,

                })
                .Distinct()
                .ToListAsync();
            return result;
        }

        public async Task<List<ClinicLocationResponseDto>> GetClinicLocations()
        {
            var response = await _context.Institutions
                .Select(x => new ClinicLocationResponseDto
                {
                    Id = x.Id,
                    InstitutionName = x.Name,
                    InstitutionSpecialties = x.InstitutionServices.Select(s => s.Specialty.Name)
                        .ToList(),  
                    FullAddress = $"{x.Address.Country} {x.Address.Number}, {x.Address.PostalCode} {x.Address.City}, {x.Address.Country}",
                    Latitude = x.Address.Latitude,
                    Longitude = x.Address.Longitude,
                    Rating = x.Appointments
                                .Where(a => a.Review != null)
                                .Select(a => (double?)a.Review.Rating)
                                .Average() ?? 0.0,
                    TotalRatings = x.Appointments.Count(a => a.Review != null)
                })
                .ToListAsync();

            return response;

        }

    }
}
