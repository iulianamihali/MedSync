using MedSync.DataLayer.DTOs.CareGiving;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class CareGivingService : ICareGivingService
    {
        private readonly MedSyncContext _context;

        public CareGivingService(MedSyncContext context) {
            _context = context;
        }

        public async Task<bool> AddPersonAsync(AddPersonRequestDto request)
        {
            var owner = await _context.Patients
                .Where(p => p.UserId == request.OwnerId)
                .Select(x => new
                {
                    Id = x.UserId,
                    Email = x.User.Email,
                    PhoneNumber = x.User.PhoneNumber

                })
                .FirstOrDefaultAsync();

            if (owner == null)
                return false;

            var newPerson = new UnregisteredPatient
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Cnp = request.Cnp,
                DateOfBirth = DateOnly.Parse(request.DateOfBirth),
                Email = owner.Email,
                PhoneNumber = owner.PhoneNumber,
                CreatedAt = DateTime.UtcNow
            };
            _context.UnregisteredPatients.Add(newPerson);
            var association = new AssociatedUser
            {
                PrimaryUserId = owner.Id,
                CareUnregisteredPatientId = newPerson.Id,
                Relationship = request.Relationship,
                CreatedAt = DateTime.UtcNow
            };
            _context.AssociatedUsers.Add(association);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<List<PersonsInCareResponseDto>> GetPersonsInCareAsync(Guid patientId)
        {
            var personsInCare = await _context.AssociatedUsers
                .Where(a => a.PrimaryUserId == patientId)
                .Select(x => new PersonsInCareResponseDto
                {
                    CareUnregisteredPatientId = x.CareUnregisteredPatientId,
                    Name = x.CareUnregisteredPatient.FirstName + " " + x.CareUnregisteredPatient.LastName
                })
                .ToListAsync();

            return personsInCare;
        }

    }
}
