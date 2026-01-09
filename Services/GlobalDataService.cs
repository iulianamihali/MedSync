using MedSync.DataLayer.DTOs.GlobalData;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

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

    }
}
