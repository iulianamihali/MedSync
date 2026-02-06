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

            var response = new CountsStatCardsResponseDto
            {
                TotalPatientsWithAppointments = totalPatientsWithAppointments,
                TotalAppointmentsByPeriod = totalAppointmentsByPeriod,
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



    }
}
