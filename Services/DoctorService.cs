using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.DTOs.Gemini;
using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly MedSyncContext _context;

        public DoctorService(MedSyncContext context)
        {
            _context = context;
        }

        public async Task<CountsStatCardsResponseDto> GetDashboardCardStatsAsync(
            DashboardFilterRequestDto request
        )
        {
            var fromLocal = request.From.ToLocalTime().Date;
            var toLocal = request.To.ToLocalTime().Date;

            var totalPatientsWithAppointments = await _context
                .Appointments.Where(a =>
                    a.InstitutionId == request.InstitutionId && a.DoctorUserId == request.DoctorId
                )
                .Select(a => a.PatientUserId ?? a.UnregisteredPatientId)
                .Distinct()
                .CountAsync();

            var totalAppointmentsByPeriod = await _context
                .Appointments.Where(a =>
                    a.InstitutionId == request.InstitutionId
                    && a.DoctorUserId == request.DoctorId
                    && a.StartDateTime >= fromLocal
                    && a.StartDateTime < toLocal.AddDays(1)
                )
                .CountAsync();
            var totalReferralsByAppointment = await _context
                .MedicalReferrals.Where(mr =>
                    mr.Appointment.InstitutionId == request.InstitutionId
                    && mr.Appointment.DoctorUserId == request.DoctorId
                    && mr.CreatedAt >= fromLocal
                    && mr.CreatedAt < toLocal.AddDays(1)
                )
                .CountAsync();
            var totalPrescriptionsByAppointment = await _context
                .Prescriptions.Where(p =>
                    p.Appointment.InstitutionId == request.InstitutionId
                    && p.Appointment.DoctorUserId == request.DoctorId
                    && p.Appointment.StartDateTime >= fromLocal
                    && p.Appointment.StartDateTime < toLocal.AddDays(1)
                )
                .CountAsync();

            var response = new CountsStatCardsResponseDto
            {
                TotalPatientsWithAppointments = totalPatientsWithAppointments,
                TotalAppointmentsByPeriod = totalAppointmentsByPeriod,
                TotalReferralsByAppointment = totalReferralsByAppointment,
                TotalPrescriptionsByAppointment = totalPrescriptionsByAppointment,
            };
            return response;
        }

        public async Task<PaginationDto<PatientsDataTableResponseDto>> GetDataTableMyPatientsAsync(
            int page,
            Guid institutionid,
            Guid doctorId
        )
        {
            var result = _context
                .Appointments.Where(a =>
                    a.InstitutionId == institutionid && a.DoctorUserId == doctorId
                )
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
                        Id = first.PatientUserId ?? first.UnregisteredPatientId ?? Guid.Empty,

                        PatientName =
                            first.Patient?.User != null
                                ? first.Patient.User.FirstName + " " + first.Patient.User.LastName
                            : first.UnregisteredPatient != null
                                ? first.UnregisteredPatient.FirstName
                                    + " "
                                    + first.UnregisteredPatient.LastName
                            : "-",

                        Address =
                            first.Patient?.User?.Address != null
                                ? first.Patient.User.Address.Country
                                    + ", "
                                    + first.Patient.User.Address.City
                                    + ", "
                                    + first.Patient.User.Address.Street
                                    + ", "
                                    + first.Patient.User.Address.Number
                                : "-",

                        PhoneNumber =
                            first.Patient?.User != null
                                ? first.Patient.User.PhoneNumber
                                : first.UnregisteredPatient?.PhoneNumber,

                        DateOfBirth = first.Patient?.User?.DateOfBirth,

                        Visits = g.Count(),

                        LastVisit = g.Max(a => a.StartDateTime),
                    };
                })
                .AsQueryable();

            var rows = result.OrderByDescending(i => i.LastVisit).Skip(page * 9).Take(9).ToList();
            var total = result.Count();
            return new PaginationDto<PatientsDataTableResponseDto>
            {
                Rows = rows,
                TotalCount = total,
            };
        }

        public async Task<List<SpecialtyServicesResponseDto>> GetSpecialtyServicesByDoctorAsync(
            Guid doctorId
        )
        {
            var list = await _context
                .DoctorSpecialties.Include(ds => ds.InstitutionService)
                    .ThenInclude(ds => ds.Specialty)
                .Include(ds => ds.InstitutionService)
                    .ThenInclude(ds => ds.Service)
                .Where(ds => ds.DoctorUserId == doctorId && ds.InstitutionService.IsActive == true)
                .ToListAsync();

            var groupBySpecialty = list.GroupBy(ds => new
            {
                ds.InstitutionService.Specialty.Id,
                ds.InstitutionService.Specialty.Name,
            });

            List<SpecialtyServicesResponseDto> response = new List<SpecialtyServicesResponseDto>();

            foreach (var item in groupBySpecialty)
            {
                List<InstitutionServiceDto> values = new List<InstitutionServiceDto>();
                foreach (var doctorSpecialty in item)
                {
                    values.Add(
                        new InstitutionServiceDto
                        {
                            DoctorSpecialtyId = doctorSpecialty.Id,
                            Id = doctorSpecialty.InstitutionService.Id,
                            ServiceId = doctorSpecialty.InstitutionService.ServiceId,
                            Name = doctorSpecialty.InstitutionService.Service.Name,
                            Price = doctorSpecialty.InstitutionService.Price,
                            Duration = doctorSpecialty.InstitutionService.Duration,
                        }
                    );
                }

                response.Add(
                    new SpecialtyServicesResponseDto
                    {
                        SpecialtyId = item.Key.Id,
                        SpecialtyName = item.Key.Name,
                        InstitutionServices = values,
                    }
                );
            }

            return response;
        }

        public async Task<bool> AddServiceAsync(AddServiceRequestDto request)
        {
            foreach (var item in request.Services)
            {
                var institutionServiceId = await _context
                    .InstitutionServices.Where(i =>
                        i.InstitutionId == request.InstitutionId
                        && i.SpecialtyId == request.SpecialtyId
                        && i.ServiceId == item
                    )
                    .Select(i => i.Id)
                    .FirstOrDefaultAsync();
                if (institutionServiceId != Guid.Empty)
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
            var list = await _context
                .DoctorSpecialties.Where(ds => doctorSpecialtyIds.Contains(ds.Id))
                .ToListAsync();
            _context.DoctorSpecialties.RemoveRange(list);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<GetInfoDoctorResponseDto> GetInfoDoctorAsync(Guid doctorId)
        {
            var specialties = await _context
                .DoctorSpecialties.Where(ds => ds.DoctorUserId == doctorId)
                .Select(ds => ds.InstitutionService.Specialty.Name)
                .Distinct()
                .ToListAsync();
            var infoDoctor = await _context
                .Doctors.Where(x => x.UserId == doctorId)
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

        public async Task<GetDoctorFeedbackResponseDto> GetDoctorFeedbackAsync(
            Guid institutionId,
            Guid doctorId
        )
        {
            var reviews = await _context
                .Reviews.Include(r => r.Appointment)
                    .ThenInclude(a => a.Patient)
                        .ThenInclude(p => p.User)
                .Where(d =>
                    d.Appointment.InstitutionId == institutionId
                    && d.Appointment.DoctorUserId == doctorId
                )
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
            var totalReviews = reviews.Count;
            var sumRatings = reviews.Sum(r => r.Rating);
            var averageRating =
                totalReviews > 0
                    ? Math.Round(
                        (decimal)sumRatings / totalReviews,
                        1,
                        MidpointRounding.AwayFromZero
                    )
                    : 0;

            var response = new GetDoctorFeedbackResponseDto
            {
                AverageRating = averageRating,
                TotalReviews = totalReviews,
                Reviews = reviews
                    .Select(r => new DoctorReviewItemDto
                    {
                        ReviewId = r.Id,
                        PatientFirstName =
                            r.Appointment.Patient != null
                                ? r.Appointment.Patient.User.FirstName
                                : null,
                        PatientLastName =
                            r.Appointment.Patient != null
                                ? r.Appointment.Patient.User.LastName
                                : null,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt,
                    })
                    .ToList(),
            };
            return response;
        }

        public async Task<List<SpecialtyServicesResponseDto>> GetSpecialtyServicesByDoctorAsync(
            Guid doctorId,
            Guid institutionId
        )
        {
            var list = await _context
                .DoctorSpecialties.Include(ds => ds.InstitutionService)
                    .ThenInclude(ds => ds.Specialty)
                .Include(ds => ds.InstitutionService)
                    .ThenInclude(ds => ds.Service)
                .Where(ds =>
                    ds.InstitutionService.InstitutionId == institutionId
                    && ds.DoctorUserId == doctorId
                    && ds.InstitutionService.IsActive == true
                )
                .ToListAsync();

            var groupBySpecialty = list.GroupBy(ds => new
            {
                ds.InstitutionService.Specialty.Id,
                ds.InstitutionService.Specialty.Name,
            });

            List<SpecialtyServicesResponseDto> response = new List<SpecialtyServicesResponseDto>();

            foreach (var item in groupBySpecialty)
            {
                List<InstitutionServiceDto> values = new List<InstitutionServiceDto>();
                foreach (var doctorSpecialty in item)
                {
                    values.Add(
                        new InstitutionServiceDto
                        {
                            DoctorSpecialtyId = doctorSpecialty.Id,
                            Id = doctorSpecialty.InstitutionService.Id,
                            ServiceId = doctorSpecialty.InstitutionService.ServiceId,
                            Name = doctorSpecialty.InstitutionService.Service.Name,
                            Price = doctorSpecialty.InstitutionService.Price,
                            Duration = doctorSpecialty.InstitutionService.Duration,
                        }
                    );
                }

                response.Add(
                    new SpecialtyServicesResponseDto
                    {
                        SpecialtyId = item.Key.Id,
                        SpecialtyName = item.Key.Name,
                        InstitutionServices = values,
                    }
                );
            }

            return response;
        }

        public async Task<DoctorAIContextDto> GetAIContextAsync(Guid doctorId, Guid institutionId)
        {
            var doctor = await _context
                .Users.Include(u => u.Doctor)
                .Where(u => u.Id == doctorId)
                .Select(u => new
                {
                    DoctorName = $"{u.FirstName} {u.LastName}",
                    YearsOfExperience = u.Doctor != null ? u.Doctor.YearsOfExperience : 0,
                    UniversityName = u.Doctor != null ? u.Doctor.UniversityName : null,
                })
                .FirstOrDefaultAsync();

            var institutionName = await _context
                .Institutions.Where(i => i.Id == institutionId)
                .Select(i => i.Name)
                .FirstOrDefaultAsync();

            var doctorSpecialties = await _context
                .DoctorSpecialties.Include(ds => ds.InstitutionService)
                    .ThenInclude(i => i.Specialty)
                .Include(ds => ds.InstitutionService)
                    .ThenInclude(i => i.Service)
                .Where(ds =>
                    ds.DoctorUserId == doctorId
                    && ds.InstitutionService.InstitutionId == institutionId
                    && ds.InstitutionService.IsActive
                )
                .ToListAsync();

            var scheduleRaw = await _context
                .UserSchedules.Where(s => s.UserId == doctorId && s.InstitutionId == institutionId)
                .OrderBy(s => s.DayOfWeek)
                .Select(s => new
                {
                    s.DayOfWeek,
                    s.StartTime,
                    s.EndTime,
                })
                .ToListAsync();

            var schedule = scheduleRaw
                .Select(s => new DoctorScheduleDto
                {
                    DayOfWeek =
                        Enum.GetName(typeof(DayOfWeek), s.DayOfWeek) ?? s.DayOfWeek.ToString(),
                    StartTime = s.StartTime.ToString("HH:mm"),
                    EndTime = s.EndTime.ToString("HH:mm"),
                })
                .ToList();

            return new DoctorAIContextDto
            {
                DoctorName = doctor?.DoctorName ?? string.Empty,
                InstitutionName = institutionName ?? string.Empty,
                YearsOfExperience = doctor?.YearsOfExperience ?? 0,
                UniversityName = doctor?.UniversityName,
                Specialties = doctorSpecialties
                    .Select(ds => ds.InstitutionService.Specialty.Name)
                    .Distinct()
                    .ToList(),
                Services = doctorSpecialties
                    .Select(ds => ds.InstitutionService.Service.Name)
                    .Distinct()
                    .ToList(),
                Schedule = schedule,
            };
        }

        public async Task<List<DoctorPatientSummaryDto>> SearchPatientSummariesAsync(
            Guid doctorId,
            Guid institutionId,
            string patientName,
            DateTime? fromDate,
            DateTime? toDate
        )
        {
            var search = patientName.Trim();
            var searchPattern = $"%{search}%";

            var query = _context
                .Appointments.AsNoTracking()
                .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                .Include(a => a.UnregisteredPatient)
                .Include(a => a.MedicalRecord)
                .Include(a => a.Prescriptions)
                    .ThenInclude(p => p.Medications)
                .Include(a => a.MedicalReferrals)
                    .ThenInclude(r => r.Specialty)
                .Where(a => a.DoctorUserId == doctorId && a.InstitutionId == institutionId)
                .Where(a =>
                    (a.Patient != null
                        && (
                            EF.Functions.Like(a.Patient.User.FirstName ?? string.Empty, searchPattern)
                            || EF.Functions.Like(a.Patient.User.LastName ?? string.Empty, searchPattern)
                            || EF.Functions.Like(
                                (a.Patient.User.FirstName ?? string.Empty)
                                    + " "
                                    + (a.Patient.User.LastName ?? string.Empty),
                                searchPattern
                            )
                        ))
                    || (a.UnregisteredPatient != null
                        && (
                            EF.Functions.Like(
                                a.UnregisteredPatient.FirstName ?? string.Empty,
                                searchPattern
                            )
                            || EF.Functions.Like(
                                a.UnregisteredPatient.LastName ?? string.Empty,
                                searchPattern
                            )
                            || EF.Functions.Like(
                                (a.UnregisteredPatient.FirstName ?? string.Empty)
                                    + " "
                                    + (a.UnregisteredPatient.LastName ?? string.Empty),
                                searchPattern
                            )
                        ))
                );

            if (fromDate.HasValue)
            {
                query = query.Where(a => a.StartDateTime >= fromDate.Value.Date);
            }

            if (toDate.HasValue)
            {
                var toInclusive = toDate.Value.Date.AddDays(1);
                query = query.Where(a => a.StartDateTime < toInclusive);
            }

            var appointments = await query.ToListAsync();

            return appointments
                .GroupBy(a => new
                {
                    PatientId = a.PatientUserId ?? a.UnregisteredPatientId ?? Guid.Empty,
                    PatientName = a.Patient != null
                        ? $"{a.Patient.User.FirstName} {a.Patient.User.LastName}"
                        : $"{a.UnregisteredPatient!.FirstName} {a.UnregisteredPatient.LastName}",
                    IsRegistered = a.PatientUserId.HasValue,
                })
                .Select(g => new DoctorPatientSummaryDto
                {
                    PatientId = g.Key.PatientId,
                    PatientName = g.Key.PatientName.Trim(),
                    IsRegistered = g.Key.IsRegistered,
                    Visits = g.Count(),
                    LastVisitUtc = g.Max(x => x.StartDateTime),
                    Symptoms = g
                        .Where(x =>
                            x.MedicalRecord != null
                            && !string.IsNullOrWhiteSpace(x.MedicalRecord.Symptoms)
                        )
                        .Select(x =>
                            $"[{x.StartDateTime:yyyy-MM-dd}] {x.MedicalRecord!.Symptoms!}"
                        )
                        .Distinct()
                        .Take(20)
                        .ToList(),
                    Diagnoses = g
                        .Where(x =>
                            x.MedicalRecord != null
                            && !string.IsNullOrWhiteSpace(x.MedicalRecord.Diagnosis)
                        )
                        .Select(x =>
                            $"[{x.StartDateTime:yyyy-MM-dd}] {x.MedicalRecord!.Diagnosis!}"
                        )
                        .Concat(
                            g.SelectMany(x => x.Prescriptions)
                                .Where(p => !string.IsNullOrWhiteSpace(p.Diagnosis))
                                .Select(p =>
                                    $"[{p.Appointment.StartDateTime:yyyy-MM-dd}] {p.Diagnosis}"
                                )
                        )
                        .Concat(
                            g.SelectMany(x => x.MedicalReferrals)
                                .Where(r => !string.IsNullOrWhiteSpace(r.SuspectedDiagnosis))
                                .Select(r =>
                                    $"[{(r.CreatedAt ?? DateTime.MinValue):yyyy-MM-dd}] (Referral) {r.SuspectedDiagnosis}"
                                )
                        )
                        .Distinct()
                        .Take(20)
                        .ToList(),
                    Medications = g
                        .SelectMany(x => x.Prescriptions)
                        .SelectMany(p => p.Medications)
                        .Where(m => !string.IsNullOrWhiteSpace(m.Name))
                        .Select(m =>
                            $"{m.Name} | strength: {m.Strength} | dosage: {m.Dosage} | frequency: {m.Frequency} | duration: {m.Duration}"
                        )
                        .Distinct()
                        .Take(30)
                        .ToList(),
                    Referrals = g
                        .SelectMany(x => x.MedicalReferrals)
                        .Select(r =>
                            $"specialty: {r.Specialty.Name}"
                            + (string.IsNullOrWhiteSpace(r.SuspectedDiagnosis)
                                ? string.Empty
                                : $" | suspected diagnosis: {r.SuspectedDiagnosis}")
                            + (string.IsNullOrWhiteSpace(r.ReasonReferral)
                                ? string.Empty
                                : $" | reason: {r.ReasonReferral}")
                            + (string.IsNullOrWhiteSpace(r.RelevantClinicalInformation)
                                ? string.Empty
                                : $" | clinical info: {r.RelevantClinicalInformation}")
                            + (r.ExpirationDate.HasValue
                                ? $" | expires: {r.ExpirationDate.Value:yyyy-MM-dd}"
                                : string.Empty)
                        )
                        .Distinct()
                        .Take(20)
                        .ToList(),
                    Recommendations = g
                        .Where(x =>
                            x.MedicalRecord != null
                            && !string.IsNullOrWhiteSpace(x.MedicalRecord.Recommendations)
                        )
                        .Select(x =>
                            $"[{x.StartDateTime:yyyy-MM-dd}] {x.MedicalRecord!.Recommendations!}"
                        )
                        .Distinct()
                        .Take(20)
                        .ToList(),
                })
                .OrderByDescending(x => x.LastVisitUtc)
                .ToList();
        }

        public async Task<List<AvailableSlotDto>> GetAvailableSlotsAsync(
            Guid doctorId,
            Guid institutionId,
            DateTime fromDate,
            DateTime toDate,
            int slotMinutes
        )
        {
            if (slotMinutes <= 0)
                slotMinutes = 30;

            var from = fromDate.Date;
            var to = toDate.Date;

            var schedules = await _context
                .UserSchedules.AsNoTracking()
                .Where(s => s.UserId == doctorId && s.InstitutionId == institutionId)
                .ToListAsync();

            var appointments = await _context
                .Appointments.AsNoTracking()
                .Where(a =>
                    a.DoctorUserId == doctorId
                    && a.InstitutionId == institutionId
                    && a.StartDateTime.Date >= from
                    && a.StartDateTime.Date <= to
                    && a.Status != AppointmentStatusEnumType.Canceled
                )
                .Select(a => new { a.StartDateTime, a.EndDateTime })
                .ToListAsync();

            var result = new List<AvailableSlotDto>();

            for (var day = from; day <= to; day = day.AddDays(1))
            {
                var dayOfWeek = (int)day.DayOfWeek;
                var daySchedules = schedules.Where(s => s.DayOfWeek == dayOfWeek).ToList();
                if (daySchedules.Count == 0)
                    continue;

                var dayAppointments = appointments
                    .Where(a => a.StartDateTime.Date == day)
                    .OrderBy(a => a.StartDateTime)
                    .ToList();

                foreach (var schedule in daySchedules)
                {
                    var workStart = day + schedule.StartTime.ToTimeSpan();
                    var workEnd = day + schedule.EndTime.ToTimeSpan();

                    var cursor = workStart;
                    while (cursor.AddMinutes(slotMinutes) <= workEnd)
                    {
                        var slotEnd = cursor.AddMinutes(slotMinutes);
                        var overlaps = dayAppointments.Any(a => cursor < a.EndDateTime && slotEnd > a.StartDateTime);

                        if (!overlaps)
                        {
                            result.Add(new AvailableSlotDto { Start = cursor, End = slotEnd });
                        }

                        cursor = cursor.AddMinutes(slotMinutes);
                    }
                }
            }

            return result;
        }
    }
}
