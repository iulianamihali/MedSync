using MedSync.DataLayer.DTOs.GlobalAdmin.Dashboard;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Services
{
    public class GlobalAdminService : IGlobalAdminService
    {
        private readonly MedSyncContext _context;

        public GlobalAdminService(MedSyncContext context)
        {
            _context = context;
        }

        public async Task<StatCardsResponseDto> GetDashboardStatsCardsAsync(
            DashboardFilterRequestDto request
        )
        {
            var currentPatientsCount = await _context
                .Patients.Include(p => p.User)
                .Where(p =>
                    p.User.CreatedAt.Date >= request.From.Date
                    && p.User.CreatedAt.Date <= request.To.Date
                )
                .CountAsync();
            var currentDoctorsCount = await _context
                .Doctors.Include(d => d.User)
                .Where(d =>
                    d.User.CreatedAt.Date >= request.From.Date
                    && d.User.CreatedAt.Date <= request.To.Date
                )
                .CountAsync();
            var currentInstitutionsCount = await _context
                .Institutions.Where(i =>
                    i.CreatedAt.Date >= request.From.Date && i.CreatedAt.Date <= request.To.Date
                )
                .CountAsync();

            var duration = (request.To - request.From).Days + 1;
            var previousFrom = request.From.AddDays(-duration);
            var previousTo = request.From.AddDays(-1);

            var previousPatientsCount = await _context
                .Patients.Include(p => p.User)
                .Where(p =>
                    p.User.CreatedAt.Date >= previousFrom.Date
                    && p.User.CreatedAt.Date <= previousTo.Date
                )
                .CountAsync();
            var previousDoctorsCount = await _context
                .Doctors.Include(d => d.User)
                .Where(d =>
                    d.User.CreatedAt.Date >= previousFrom.Date
                    && d.User.CreatedAt.Date <= previousTo.Date
                )
                .CountAsync();
            var previousInstitutionsCount = await _context
                .Institutions.Where(i =>
                    i.CreatedAt.Date >= previousFrom.Date && i.CreatedAt.Date <= previousTo.Date
                )
                .CountAsync();

            var patientsInRange = await _context
                .Patients.Include(p => p.User)
                .Where(p =>
                    p.User.CreatedAt.Date >= request.From.Date
                    && p.User.CreatedAt.Date <= request.To.Date
                )
                .ToListAsync();
            var doctorsInRange = await _context
                .Doctors.Include(d => d.User)
                .Where(d =>
                    d.User.CreatedAt.Date >= request.From.Date
                    && d.User.CreatedAt.Date <= request.To.Date
                )
                .ToListAsync();
            var institutionsInRange = await _context
                .Institutions.Where(i =>
                    i.CreatedAt.Date >= request.From.Date && i.CreatedAt.Date <= request.To.Date
                )
                .ToListAsync();

            TimeGroupingType timeGrouping =
                duration <= 31 ? TimeGroupingType.Daily
                : duration <= 210 ? TimeGroupingType.Weekly
                : duration <= 365 ? TimeGroupingType.Monthly
                : TimeGroupingType.Yearly;

            var response = new StatCardsResponseDto
            {
                Patients = new StatCardDto
                {
                    Title = "Patients",
                    Value = currentPatientsCount,
                    Trend =
                        currentPatientsCount > previousPatientsCount ? "up"
                        : currentPatientsCount < previousPatientsCount ? "down"
                        : "neutral",
                    TrendValue =
                        currentPatientsCount == 0
                            ? 0
                            : (int)
                                Math.Round(
                                    (
                                        (double)(currentPatientsCount - previousPatientsCount)
                                        / (
                                            previousPatientsCount == 0
                                                ? currentPatientsCount
                                                : previousPatientsCount
                                        )
                                    ) * 100,
                                    2
                                ),
                    ChartData = GroupPatientsByPeriod(patientsInRange, timeGrouping),
                },
                Doctors = new StatCardDto
                {
                    Title = "Doctors",
                    Value = currentDoctorsCount,
                    Trend =
                        currentDoctorsCount > previousDoctorsCount ? "up"
                        : currentDoctorsCount < previousDoctorsCount ? "down"
                        : "neutral",
                    TrendValue =
                        currentDoctorsCount == 0
                            ? 0
                            : (int)
                                Math.Round(
                                    (
                                        (double)(currentDoctorsCount - previousDoctorsCount)
                                        / (
                                            previousDoctorsCount == 0
                                                ? currentDoctorsCount
                                                : previousDoctorsCount
                                        )
                                    ) * 100,
                                    2
                                ),
                    ChartData = GroupDoctorsByPeriod(doctorsInRange, timeGrouping),
                },
                Institutions = new StatCardDto
                {
                    Title = "Institutions",
                    Value = currentInstitutionsCount,
                    Trend =
                        currentInstitutionsCount > previousInstitutionsCount ? "up"
                        : currentInstitutionsCount < previousInstitutionsCount ? "down"
                        : "neutral",
                    TrendValue =
                        currentInstitutionsCount == 0
                            ? 0
                            : (int)
                                Math.Round(
                                    (
                                        (double)(
                                            currentInstitutionsCount - previousInstitutionsCount
                                        )
                                        / (
                                            previousInstitutionsCount == 0
                                                ? currentInstitutionsCount
                                                : previousInstitutionsCount
                                        )
                                    ) * 100,
                                    2
                                ),
                    ChartData = GroupInstitutionsByPeriod(institutionsInRange, timeGrouping),
                },
            };
            return response;
        }

        public async Task<List<SupportBarchartPointsDto>> GetDashboardSupportStatsBarChart(
            DashboardFilterRequestDto requestDto
        )
        {
            var result = await _context
                .SupportIssues.Where(s =>
                    s.CreatedAt.Date >= requestDto.From.Date
                    && s.CreatedAt.Date <= requestDto.To.Date
                )
                .ToListAsync();
            var groupedResultBasedOnType = result
                .GroupBy(s => s.Type)
                .Select(g => new SupportBarchartPointsDto { Type = g.Key, Value = g.Count() });
            return groupedResultBasedOnType.ToList();
        }

        public async Task<List<PieChartTopInstDto>> GetDashboardTopInstitutionsPieChart(
            DashboardFilterRequestDto requestDto
        )
        {
            var rows = await _context
                .Appointments.Include(a => a.Institution)
                .Where(a =>
                    a.CreatedAt.Date >= requestDto.From.Date
                    && a.CreatedAt.Date <= requestDto.To.Date
                )
                .ToListAsync();
            var total = rows.Count;
            var groupedResultBasedOnInstitution = rows.GroupBy(a => new
            {
                Id = a.InstitutionId,
                Name = a.Institution.Name,
            });
            List<PieChartTopInstDto> pieChartData = new List<PieChartTopInstDto>();
            foreach (var groupList in groupedResultBasedOnInstitution)
            {
                var totalForGroup = groupList.Count();
                pieChartData.Add(
                    new PieChartTopInstDto
                    {
                        Name = groupList.Key.Name,
                        Total = totalForGroup,
                        Percentage = Math.Round(((double)totalForGroup / total) * 100.0, 2),
                    }
                );
            }
            pieChartData = pieChartData.OrderByDescending(a => a.Total).ToList();
            var top3 = pieChartData.Take(3).ToList();
            var otherTotal = pieChartData.Skip(3).Sum(a => a.Total);
            var otherPercentage = Math.Round(((double)otherTotal / total) * 100.0, 2);

            if (otherTotal > 0)
            {
                top3.Add(
                    new PieChartTopInstDto
                    {
                        Name = "Other",
                        Total = otherTotal,
                        Percentage = otherPercentage,
                    }
                );
            }
            return top3;
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

        private List<ChartStatPointDto> GroupPatientsByPeriod(
            List<Patient> patients,
            TimeGroupingType groupingType
        )
        {
            var result = new Dictionary<DateTime, int>();
            foreach (var p in patients)
            {
                var key = GetPeriodStartDate(p.User.CreatedAt.Date, groupingType);
                if (result.ContainsKey(key))
                    result[key]++;
                else
                    result[key] = 1;
            }

            return result
                .Select(x => new ChartStatPointDto { Date = x.Key, Value = x.Value })
                .ToList();
        }

        private List<ChartStatPointDto> GroupDoctorsByPeriod(
            List<Doctor> doctors,
            TimeGroupingType groupingType
        )
        {
            var result = new Dictionary<DateTime, int>();
            foreach (var d in doctors)
            {
                var key = GetPeriodStartDate(d.User.CreatedAt.Date, groupingType);
                if (result.ContainsKey(key))
                    result[key]++;
                else
                    result[key] = 1;
            }

            return result
                .Select(x => new ChartStatPointDto { Date = x.Key, Value = x.Value })
                .ToList();
        }

        private List<ChartStatPointDto> GroupInstitutionsByPeriod(
            List<Institution> institutions,
            TimeGroupingType groupingType
        )
        {
            var result = new Dictionary<DateTime, int>();
            foreach (var i in institutions)
            {
                var key = GetPeriodStartDate(i.CreatedAt.Date, groupingType);
                if (result.ContainsKey(key))
                    result[key]++;
                else
                    result[key] = 1;
            }

            return result
                .Select(x => new ChartStatPointDto { Date = x.Key, Value = x.Value })
                .ToList();
        }
    }
}
