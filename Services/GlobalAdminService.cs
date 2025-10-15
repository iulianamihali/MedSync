using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;
using MedSync.DataLayer.Enums;

namespace MedSync.Services
{
    public class GlobalAdminService : IGlobalAdminService
    {
        private readonly MedSyncContext _context;
        public GlobalAdminService(MedSyncContext context)
        {
            _context = context;
        }
       
        public async Task<StatCardsResponseDto> GetDashboardStatsCardsAsync(StatCardsRequestDto request)
        {
            var currentPatientsCount = await _context.Patients
                .Where(p => p.User.CreatedAt >= request.From && p.User.CreatedAt <= request.To)
                .CountAsync();
            var currentDoctorsCount = await _context.Doctors
                .Where(d => d.User.CreatedAt >= request.From && d.User.CreatedAt <= request.To)
                .CountAsync();
            var currentInstituionsCount = await _context.Institutions
                .Where(i => i.CreatedAt >= request.From && i.CreatedAt <= request.To)
                .CountAsync();

            var duration = (request.To - request.From).Days + 1;
            var previousFrom = request.From.AddDays(-duration);
            var previousTo = request.From.AddDays(-1);

            var previousPatientsCount = await _context.Patients
                .Where(p => p.User.CreatedAt >= previousFrom && p.User.CreatedAt <= previousTo)
                .CountAsync();
            var previousDoctorsCount = await _context.Doctors
                .Where(d => d.User.CreatedAt >= previousFrom && d.User.CreatedAt <= previousTo)
                .CountAsync();
            var previousInstituionsCount = await _context.Institutions
                .Where(i => i.CreatedAt >= previousFrom && i.CreatedAt <= previousTo)
                .CountAsync();

            var patientsInRange = await _context.Patients
                .Where(p => p.User.CreatedAt >= request.From && p.User.CreatedAt <= request.To)
                .ToListAsync();
            var doctorsInRange = await _context.Doctors
                .Where(d => d.User.CreatedAt >= request.From && d.User.CreatedAt <= request.To)
                .ToListAsync();
            var institutionsInRange = await _context.Institutions
                .Where(i => i.CreatedAt >= request.From && i.CreatedAt <= request.To)
                .ToListAsync();

            TimeGroupingType timeGrouping = duration <= 31
               ? TimeGroupingType.Daily
               : duration <= 210
                   ? TimeGroupingType.Weekly
               : duration <= 365
                     ? TimeGroupingType.Monthly
                     : TimeGroupingType.Yearly;

            var response = new StatCardsResponseDto
            {
                Patients = new StatCardDto
                {
                    Title = "Patients",
                    Value = currentPatientsCount,
                    Trend = currentPatientsCount > previousPatientsCount
                        ? "up"
                        : currentPatientsCount < previousPatientsCount
                            ? "down"
                            : "neutral",
                    ChartData = GroupPatientsByPeriod(patientsInRange, timeGrouping)

                },
                Doctors = new StatCardDto
                {
                    Title = "Doctors",
                    Value = currentDoctorsCount,
                    Trend = currentDoctorsCount > previousDoctorsCount
                        ? "up"
                        : currentDoctorsCount < previousDoctorsCount
                            ? "down"
                            : "neutral",
                    ChartData = GroupDoctorsByPeriod(doctorsInRange, timeGrouping)
                },
                Institutions = new StatCardDto
                {
                    Title = "Institutions",
                    Value = currentInstituionsCount,
                    Trend = currentInstituionsCount > previousInstituionsCount
                        ? "up"
                        : currentInstituionsCount < previousInstituionsCount
                            ? "down"
                            : "neutral",
                    ChartData = GroupInstitutionsByPeriod(institutionsInRange, timeGrouping)
                }
            };
            return response;
        }

        private DateTime GetPeriodStartDate(DateTime date, TimeGroupingType groupingType)
        {
            if (groupingType == TimeGroupingType.Daily)
                return date.Date;
            if (groupingType == TimeGroupingType.Weekly)
            {
                var dayOfWeek = (int)date.DayOfWeek;
                var daysBackToMonday = (dayOfWeek == 0 ? 6 : dayOfWeek - 1);
                var startOfWeek = date.AddDays(-daysBackToMonday).Date;
                return startOfWeek;
            }
            if (groupingType == TimeGroupingType.Monthly)
            {
                return new DateTime(date.Year, date.Month, 1);
            }
            return new DateTime(date.Year, 1, 1);

        }
        private List<ChartStatPointDto> GroupPatientsByPeriod(List<Patient> patients, TimeGroupingType groupingType)
        {
            var result = new Dictionary<DateTime, int>();
            foreach (var p in patients)
            {
                var key = GetPeriodStartDate(p.User.CreatedAt, groupingType);
                if (result.ContainsKey(key))
                    result[key]++;
                else
                    result[key] = 1;
            }
           
            return result.Select(x => new ChartStatPointDto { 
                Date = x.Key,
                Value = x.Value,
            }).ToList();
        }
        private List<ChartStatPointDto> GroupDoctorsByPeriod(List<Doctor> doctors, TimeGroupingType groupingType)
        {
            var result = new Dictionary<DateTime, int>();
            foreach (var d in doctors)
            {
                var key = GetPeriodStartDate(d.User.CreatedAt, groupingType);
                if (result.ContainsKey(key))
                    result[key]++;
                else
                    result[key] = 1;
            }

            return result.Select(x => new ChartStatPointDto
            {
                Date = x.Key,
                Value = x.Value,
            }).ToList();
        }
        private List<ChartStatPointDto> GroupInstitutionsByPeriod(List<Institution> institutions, TimeGroupingType groupingType)
        {
            var result = new Dictionary<DateTime, int>();
            foreach (var i in institutions)
            {
                var key = GetPeriodStartDate(i.CreatedAt, groupingType);
                if (result.ContainsKey(key))
                    result[key]++;
                else
                    result[key] = 1;
            }

            return result.Select(x => new ChartStatPointDto
            {
                Date = x.Key,
                Value = x.Value,
            }).ToList();
        }

    }
}
