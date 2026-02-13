using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly MedSyncContext _context;
        public DoctorService(MedSyncContext context) {
            _context = context;
        }
        public async Task<CountsStatCardsResponseDto> GetDashboardCardStatsAsync(DashboardFilterRequestDto request)
        {
            var fromLocal = request.From.ToLocalTime().Date;
            var toLocal = request.To.ToLocalTime().Date;

            var totalPatientsWithAppointments = await _context.Appointments
                .Where(a => a.InstitutionId == request.InstitutionId &&
                a.DoctorUserId == request.DoctorId)
                .Select(a => a.PatientUserId ?? a.UnregisteredPatientId)
                .Distinct()
                .CountAsync();

            var totalAppointmentsByPeriod = await _context.Appointments
                .Where(a => a.InstitutionId == request.InstitutionId &&
                a.DoctorUserId == request.DoctorId && 
                a.StartDateTime >= fromLocal && a.StartDateTime < toLocal.AddDays(1)
                )
                .CountAsync();
            var totalReferralsByAppointment = await _context.MedicalReferrals
                 .Where(mr =>
                     mr.Appointment.InstitutionId == request.InstitutionId &&
                     mr.Appointment.DoctorUserId == request.DoctorId &&
                     mr.CreatedAt >= fromLocal &&
                     mr.CreatedAt < toLocal.AddDays(1)
                 )
                 .CountAsync();

            var response = new CountsStatCardsResponseDto
            {
                TotalPatientsWithAppointments = totalPatientsWithAppointments,
                TotalAppointmentsByPeriod = totalAppointmentsByPeriod,
                TotalReferralsByAppointment = totalReferralsByAppointment,
            };
            return response;
                
        }

        public async Task<PaginationDto<PatientsDataTableResponseDto>> GetDataTableMyPatientsAsync(int page, Guid institutionid, Guid doctorId)
        {
            var result = _context.Appointments
    .Where(a => a.InstitutionId == institutionid && a.DoctorUserId == doctorId)

    .Include(a => a.Patient)
        .ThenInclude(p => p.User)
            .ThenInclude(u => u.Address)

    .Include(a => a.UnregisteredPatient)

    .AsEnumerable()
    .GroupBy(a => new { a.PatientUserId, a.UnregisteredPatientId })
    .Select(g =>
    {
        var first = g.First();

        return new PatientsDataTableResponseDto
        {
            Id = first.PatientUserId
                 ?? first.UnregisteredPatientId
                 ?? Guid.Empty,

            PatientName =
                first.Patient?.User != null
                    ? first.Patient.User.FirstName + " " + first.Patient.User.LastName
                    : first.UnregisteredPatient != null
                        ? first.UnregisteredPatient.FirstName + " " + first.UnregisteredPatient.LastName
                        : "-",

            Address =
                first.Patient?.User?.Address != null
                    ? first.Patient.User.Address.Country + ", " +
                      first.Patient.User.Address.City + ", " +
                      first.Patient.User.Address.Street + ", " +
                      first.Patient.User.Address.Number
                    : "-",

            PhoneNumber =
                first.Patient?.User != null
                    ? first.Patient.User.PhoneNumber
                    : first.UnregisteredPatient?.PhoneNumber,

            DateOfBirth =
                first.Patient?.User?.DateOfBirth,

            Visits = g.Count(),

            LastVisit = g.Max(a => a.StartDateTime)
        };
    })
    .AsQueryable();


            var rows = result
               .OrderByDescending(i => i.LastVisit)
               .Skip(page * 9)
               .Take(9)
               .ToList();
            var total =  result.Count();
            return new PaginationDto<PatientsDataTableResponseDto>
            {
                Rows = rows,
                TotalCount = total,
            };
        }

        public async Task<List<SpecialtyServicesResponseDto>> GetSpecialtyServicesByDoctorAsync(Guid doctorId)
        {
            var list = await _context.DoctorSpecialties
                .Include(ds => ds.InstitutionService)
                    .ThenInclude(ds => ds.Specialty)
                .Include(ds => ds.InstitutionService)
                    .ThenInclude(ds => ds.Service)
                .Where(ds => ds.DoctorUserId == doctorId && ds.InstitutionService.IsActive == true)
                .ToListAsync();

            var groupBySpecialty = list.GroupBy(ds => new
            {
                ds.InstitutionService.Specialty.Id,
                ds.InstitutionService.Specialty.Name
            });

            List<SpecialtyServicesResponseDto> response = new List<SpecialtyServicesResponseDto>();

            foreach (var item in groupBySpecialty)
            {
                List<InstitutionServiceDto> values = new List<InstitutionServiceDto>();
                foreach(var doctorSpecialty in item)
                {
                    values.Add(new InstitutionServiceDto
                    {
                        DoctorSpecialtyId = doctorSpecialty.Id,
                        Id = doctorSpecialty.InstitutionService.Id,
                        ServiceId = doctorSpecialty.InstitutionService.ServiceId,
                        Name = doctorSpecialty.InstitutionService.Service.Name,
                        Price = doctorSpecialty.InstitutionService.Price,
                        Duration = doctorSpecialty.InstitutionService.Duration,
                    });
                }

                response.Add(new SpecialtyServicesResponseDto
                {
                    SpecialtyId = item.Key.Id,
                    SpecialtyName = item.Key.Name,
                    InstitutionServices = values
                });

            }

            return response;
        }

        public async Task<bool> AddServiceAsync(AddServiceRequestDto request)
        {
            foreach(var item in request.Services)
            {
                var institutionServiceId = await _context.InstitutionServices
                    .Where(i => i.InstitutionId == request.InstitutionId &&
                        i.SpecialtyId == request.SpecialtyId &&
                        i.ServiceId == item)
                    .Select(i => i.Id)
                    .FirstOrDefaultAsync();
                if(institutionServiceId != Guid.Empty)
                {
                    var doctorSpecialty = new DoctorSpecialty
                    {
                        Id = Guid.NewGuid(),
                        DoctorUserId = request.DoctorId.Value,
                        InstitutionServiceId = institutionServiceId,
                    };
                    _context.DoctorSpecialties.Add(doctorSpecialty);
                }
             
            }
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteSpecialtyAsync(List<Guid> doctorSpecialtyIds)
        {
            var list = await _context.DoctorSpecialties
                .Where(ds => doctorSpecialtyIds.Contains(ds.Id))
                .ToListAsync();
            _context.DoctorSpecialties.RemoveRange(list);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<GetInfoDoctorResponseDto> GetInfoDoctorAsync(Guid doctorId)
        {
            var specialties = await _context.DoctorSpecialties
                .Where(ds => ds.DoctorUserId == doctorId)
                .Select(ds => ds.InstitutionService.Specialty.Name)
                .Distinct()
                .ToListAsync();
            var infoDoctor = await _context.Doctors
                .Where(x => x.UserId == doctorId)
                .FirstOrDefaultAsync();
            var response = new GetInfoDoctorResponseDto
            {
                Id = doctorId,
                YearsOfExperience = infoDoctor.YearsOfExperience,
                MedicalLicenseNumber = infoDoctor.MedicalLicenseNumber,
                UniversityName = infoDoctor.UniversityName,
                Specialties = string.Join(", ", specialties),
            };
            return response;
        }

        public async Task<GetDoctorFeedbackResponseDto> GetDoctorFeedbackAsync(Guid institutionId, Guid doctorId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Appointment)
                    .ThenInclude(a => a.Patient)
                        .ThenInclude(p => p.User)
                .Where(d => d.Appointment.InstitutionId == institutionId && d.Appointment.DoctorUserId == doctorId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
            var totalReviews = reviews.Count;
            var sumRatings = reviews.Sum(r => r.Rating);
            var averageRating = totalReviews > 0 ? Math.Round((decimal)sumRatings / totalReviews, 1, MidpointRounding.AwayFromZero) : 0;

            var response = new GetDoctorFeedbackResponseDto
            {
                AverageRating = averageRating,
                TotalReviews = totalReviews,
                Reviews = reviews.Select(r => new DoctorReviewItemDto
                {
                    ReviewId = r.Id,
                    PatientName = r.Appointment.Patient != null ? r.Appointment.Patient.User.FirstName + " " + r.Appointment.Patient.User.LastName : "",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList()
            };
            return response;
        }


    }
}
