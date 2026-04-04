using Azure;
using Azure.Core;
using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.Doctor;
using MedSync.DataLayer.DTOs.GlobalData;
using MedSync.DataLayer.DTOs.Institution;
using MedSync.DataLayer.DTOs.User;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services.IServices;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using NanoidDotNet;
using NanoidDotNet;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
namespace MedSync.Services
{
    public class InstitutionServices : IInstitutionService
    {
        private readonly MedSyncContext _context;
        private readonly PasswordHasher<User> _passwordHasher = new();
        private readonly MailerSendService _mailerSendService;

        public InstitutionServices(MedSyncContext context, MailerSendService mailerSendService)
        {
            _context = context;
            _mailerSendService = mailerSendService;
        }

        public async Task<string> GetInstitutionName(Guid institutionId)
        {
            var result = await _context.Institutions
                .Where(i => i.Id == institutionId)
                .Select(i => i.Name)
                .FirstOrDefaultAsync();
            return result;
        }

        public async Task<bool> RegisterInstitutionAsync(InstitutionRequestDto requestDto)
        {
            var newAddress = new Address
            {
                Id = Guid.NewGuid(),
                Country = requestDto.Country,
                City = requestDto.City,
                Street = requestDto.StreetAddress,
                Number = requestDto.StreetNumber,
                PostalCode = requestDto.PostalCode,
            };
            _context.Addresses.Add(newAddress);

            var newInstitution = new Institution
            {
                Id = Guid.NewGuid(),
                Name = requestDto.InstitutionName,
                TaxIdentificationNumber = requestDto.TaxIdentificationNumber,
                PhoneNumber = requestDto.PhoneNumber,
                CreatedAt = DateTime.UtcNow,
                AddressId = newAddress.Id,
                Code = GenerateInstitutionCode(requestDto.InstitutionName),
                Active = false,
            };
            _context.Institutions.Add(newInstitution);

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Role = UserType.LocalAdmin,
                FirstName = requestDto.FirstName,
                LastName = requestDto.LastName,
                Gender = null,
                DateOfBirth = null,
                PhoneNumber = requestDto.PhoneNumber,
                Email = requestDto.Email,
                CreatedAt = DateTime.UtcNow,
                IsActive = false,
                AddressId = newAddress.Id,
            };
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, requestDto.Password);
            _context.Users.Add(newUser);

            var newInstitutionRequest = new InstitutionRequests
            {
                Id = Guid.NewGuid(),
                UserId = newUser.Id,
                InstitutionId = newInstitution.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null,
                Status = InstitutionRequestsStatusEnumType.Pending,

            };
            _context.InstitutionRequests.Add(newInstitutionRequest);

            var newInstitutionUser = new InstitutionUser
            {
                InstitutionId = newInstitution.Id,
                UserId = newUser.Id,
                CreatedAt = DateTime.Now,
            };
            _context.InstitutionUsers.Add(newInstitutionUser);

            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<int> CountInstitutionRequestsAsync()
        {
            var result = await _context.InstitutionRequests
                .Where(instReq => instReq.Status == InstitutionRequestsStatusEnumType.Pending)
                .CountAsync();
            return result;
        }

        public async Task<List<InstitutionReqPopUpResponseDto>> GetInstitutionRequestDetailsAsync()
        {
            var result = await _context.InstitutionRequests
                .AsNoTracking()
                .Where(u => u.Status == InstitutionRequestsStatusEnumType.Pending)
                .Include(u => u.User)
                .Include(u => u.Institution).ThenInclude(u => u.Address)
                .Select(u => new InstitutionReqPopUpResponseDto
                {
                    Id = u.Id,
                    Name = u.Institution.Name,
                    TaxIdentificationNumber = u.Institution.TaxIdentificationNumber,
                    PhoneNumber = u.User.PhoneNumber,
                    Email = u.User.Email,
                    Country = u.Institution.Address.Country,
                    City = u.Institution.Address.City,
                    StreetAddress = u.Institution.Address.Street,
                    StreetNumber = u.Institution.Address.Number,
                    CreatedAt = u.CreatedAt
                })
                .OrderBy(u => u.CreatedAt)
                .ToListAsync();
            return result;
                
        }

        public async Task<bool> UpdateStatusInstitutionRequestAsync(UpdateInstitutionRequestDto request)
        {
            var result = await _context.InstitutionRequests
                  .Include(u => u.Institution)
                  .Where(u => u.Id == request.Id)
                  .FirstOrDefaultAsync();
            if (result != null)
            {
                if (request.Value)
                {
                    result.Status = InstitutionRequestsStatusEnumType.Approved;
                    result.UpdatedAt = DateTime.UtcNow;
                    _context.InstitutionRequests.Update(result);
                    var institution = await _context.Institutions.FirstOrDefaultAsync(x => x.Id == result.InstitutionId);
                    if (institution != null)
                    {
                        institution.Active = true;
                        _context.Institutions.Update(institution);
                    }

                    var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == result.UserId);
                    if (user != null)
                    {
                        user.IsActive = true;
                        _context.Users.Update(user);
                    }


                }
                else
                {
                    result.Status = InstitutionRequestsStatusEnumType.Rejected;
                    result.UpdatedAt = DateTime.UtcNow;
                    _context.InstitutionRequests.Update(result);

                }

                var success = (await _context.SaveChangesAsync()) > 0;

                if (success) {
                    var json = File.ReadAllText("EmailTemplates.json");
                    using var doc = JsonDocument.Parse(json);
                    if (request.Value)
                    {
                        var template = doc.RootElement.GetProperty("InstitutionApproved");
                        var subject = template.GetProperty("subject").GetString();
                        var html = template.GetProperty("html").GetString()
                            .Replace("{{InstitutionName}}", result.Institution.Name)
                            .Replace("{{AccessCode}}", result.Institution.Code);
                        await _mailerSendService.SendEmailAsync(
                            toEmail: "miuliana959@gmail.com",
                            subject: subject,
                            message: html
                            );
                        
                    }
                    else {
                        var template = doc.RootElement.GetProperty("InstitutionRejected");
                        var subject = template.GetProperty("subject").GetString();
                        var html = template.GetProperty("html").GetString()
                            .Replace("{{InstitutionName}}", result.Institution.Name);
                        await _mailerSendService.SendEmailAsync(
                           toEmail: "miuliana959@gmail.com",
                           subject: template.GetProperty("subject").GetString(),
                           message: html
                           );
                    }
                    return success;
                }

            }
            return false;

        }
        public async Task<PaginationDto<InstitutionsDataTableResponseDto>> GetInstitutionsDataTableAsync(int page)
        {
            var result = _context.InstitutionRequests
                .Include(i => i.User)
                    .ThenInclude(i => i.Address)
                .Include(i => i.Institution)
                .Select(i => new InstitutionsDataTableResponseDto
                {
                    Id = i.Institution.Id,
                    InstitutionName = i.Institution.Name,
                    AdminName = $"{i.User.FirstName} {i.User.LastName}",
                    Address = $"{i.Institution.Address.Country}, {i.Institution.Address.City}, {i.Institution.Address.Street}, {i.Institution.Address.Number}",
                    Country = i.Institution.Address.Country,
                    City = i.Institution.Address.City,
                    StreetAddress = i.Institution.Address.Street,
                    StreetNumber = i.Institution.Address.Number,
                    PostalCode = i.Institution.Address.PostalCode,
                    Email = i.User.Email,
                    PhoneNumber = i.User.PhoneNumber,
                    CreatedAt = i.Institution.CreatedAt,
                    Status = i.Institution.Active

                })
                .AsQueryable();
            var rows = await result
                .Skip(page * 9)
                .Take(9)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
            var total = await result.CountAsync();
            return new PaginationDto<InstitutionsDataTableResponseDto>
            {
                Rows = rows,
                TotalCount = total,
            };
        }

        public async Task<bool> UpdateInstitutionsInfoAsync(UpdateInstitutionsInfoDto request)
        {
            var result = await _context.Institutions
                    .Include(i => i.Address)
                    .Where(i => i.Id == request.Id)
                .FirstOrDefaultAsync();
            if(result != null)
            {
                result.Name = request.InstitutionName;
                result.Address.Country = request.Country;
                result.Address.City = request.City;
                result.Address.Street = request.StreetAddress;
                result.Address.Number = request.StreetNumber;
                result.Address.PostalCode = request.PostalCode;
                result.Active = request.Status;
                _context.Institutions.Update(result);
            }
            return (await _context.SaveChangesAsync()) > 0;
        }
        public async Task<List<SpecialtyWithServicesDto>> GetSpecialtiesWithServices(Guid institutionId)
        {
            var result = await _context.InstitutionServices
                .Where(s => s.InstitutionId == institutionId)
                .GroupBy(s => new { s.Specialty.Id, s.Specialty.Name })
                .Select(g => new SpecialtyWithServicesDto
                {
                    SpecialtyId = g.Key.Id,
                    SpecialtyName = g.Key.Name,
                    Services = g.Select(x => new ServiceDto
                    {
                        Id = x.Service.Id,
                        Name = x.Service.Name,
                        Price = x.Price,
                    }).ToList()
                })
                .ToListAsync();

            return result;
        }
        public async Task<List<DoctorDto>> GetDoctorsWithSlots(GetDoctorsWithSlotsRequestDto request)
        {
            var result = new List<DoctorDto>();

            var service = await _context.InstitutionServices
                .FirstOrDefaultAsync(s =>
                    s.InstitutionId == request.InstitutionId &&
                    s.ServiceId == request.ServiceId);

            if (service == null)
                return result;

            var slotDuration = TimeSpan.FromMinutes(service.Duration);

            if (slotDuration.TotalMinutes == 0)
                return result;

            var doctors = await _context.InstitutionUsers
                .Include(i => i.User)
                    .ThenInclude(u => u.Doctor)
                        .ThenInclude(d => d.DoctorSpecialties)
                .Where(i =>
                    i.InstitutionId == request.InstitutionId &&
                    i.User.Role == UserType.Doctor )
                    //i.User.Doctor.DoctorSpecialties.Any(ds => ds.SpecialtyId == request.SpecialtyId))
                .ToListAsync();

            var localDate = request.From.ToLocalTime().Date;
            var dayOfWeek = (int)localDate.DayOfWeek;
            var now = DateTime.Now;

            foreach (var doctor in doctors)
            {
                var schedule = await _context.UserSchedules
                    .FirstOrDefaultAsync(s =>
                        s.InstitutionId == request.InstitutionId &&
                        s.UserId == doctor.UserId &&
                        s.DayOfWeek == dayOfWeek);

                if (schedule == null)
                    continue;

                var workStart = localDate.Add(schedule.StartTime.ToTimeSpan());
                var workEnd = localDate.Add(schedule.EndTime.ToTimeSpan());

                var start = workStart;

                if (localDate == now.Date)
                {
                    while (start + slotDuration <= workEnd && start <= now)
                    {
                        start = start.Add(slotDuration);
                    }
                }

                var slots = new List<AvailableSlotDto>();

                for (var t = start; t + slotDuration <= workEnd; t = t.Add(slotDuration))
                {
                    var slotEnd = t.Add(slotDuration);

                    var isBusy = await _context.Appointments.AnyAsync(a =>
                        a.DoctorUserId == doctor.UserId &&
                        a.InstitutionId == request.InstitutionId &&
                        a.StartDateTime < slotEnd &&
                        a.EndDateTime > t
                    );

                    if (!isBusy)
                    {
                        slots.Add(new AvailableSlotDto
                        {
                            Start = t,
                            End = slotEnd
                        });
                    }
                }

                if (!slots.Any())
                    continue;

                result.Add(new DoctorDto
                {
                    Id = doctor.UserId,
                    Name = $"{doctor.User.FirstName} {doctor.User.LastName}",
                    Slots = slots
                });
            }

            return result;
        }

        public async Task<List<AvailableSlotDto>> GetScheduleForDoctor(GetDoctorsWithSlotsRequestDto request, Guid doctorId, InstitutionService service)
        {
            var slotDuration = TimeSpan.FromMinutes(service.Duration);

            if (slotDuration.TotalMinutes == 0)
                return [];

            var localDate = request.From.ToLocalTime().Date;
            var dayOfWeek = (int)localDate.DayOfWeek;
            var now = DateTime.Now;

            var schedule = await _context.UserSchedules
                    .FirstOrDefaultAsync(s =>
                        s.InstitutionId == request.InstitutionId &&
                        s.UserId == doctorId &&
                        s.DayOfWeek == dayOfWeek);

            if (schedule == null)
                return [];

            var workStart = localDate.Add(schedule.StartTime.ToTimeSpan());
                var workEnd = localDate.Add(schedule.EndTime.ToTimeSpan());

                var start = workStart;

                if (localDate == now.Date)
                {
                    while (start + slotDuration <= workEnd && start <= now)
                    {
                        start = start.Add(slotDuration);
                    }
                }

                var slots = new List<AvailableSlotDto>();
                var appointments = await _context.Appointments
                    .Where(a => a.DoctorUserId == doctorId &&
                a.InstitutionId == request.InstitutionId &&
                a.StartDateTime.Date == localDate)
                .ToListAsync();

            for (var t = start; t + slotDuration <= workEnd; t = t.Add(slotDuration))
                {
                    var slotEnd = t.Add(slotDuration);

                var isBusy = appointments.Any(a =>
                     a.StartDateTime < slotEnd &&
                     a.EndDateTime > t
                    );

                if (!isBusy)
                    {
                        slots.Add(new AvailableSlotDto
                        {
                            Start = t,
                            End = slotEnd
                        });
                    }
                }

            //if (!slots.Any())
            //    continue;

            return slots;
        }

        public async Task<PatientSearchResultDto?> SearchPatients(SearchPatients request)
        {
            var result = await _context.Users
                .Include(u => u.Patient)
                .Where(u => u.Role == UserType.Patient && 
                (u.PhoneNumber == request.PhoneNumber || u.Patient.Cnp == request.Cnp))
                .FirstOrDefaultAsync();
            if (result != null)
            {
                return new PatientSearchResultDto
                {
                    Id = result.Id,
                    Name = $"{result.FirstName} {result.LastName}",
                    IsRegistered = true,
                };
            }

            var result2 = await _context.UnregisteredPatients
                .Where(u => u.Cnp == request.Cnp || u.PhoneNumber == request.PhoneNumber)
                .FirstOrDefaultAsync();
            if (result2 != null) {
                return new PatientSearchResultDto
                {
                    Id = result2.Id,
                    Name = $"{result2.FirstName} {result2.LastName}",
                    IsRegistered = false,
                };
            }
            return null;

        }

        public async Task<PaginationDto<PatientsDataTableResponseDto>> GetDataTablePatients(int page, Guid institutionId)
        {
            var result = _context.Appointments
                .Where(a => a.InstitutionId == institutionId && a.Status == AppointmentStatusEnumType.Completed && a.PatientUserId.HasValue)
                .GroupBy(a => a.PatientUserId)
                .Select(g => new PatientsDataTableResponseDto
                {
                    Id = g.Key.Value,
                    PatientName = g.First().Patient.User.FirstName + " " + g.First().Patient.User.LastName,
                    Address = g.First().Patient.User.Address.Country + ", " +
                              g.First().Patient.User.Address.City + ", " +
                              g.First().Patient.User.Address.Street + ", " +
                              g.First().Patient.User.Address.Number,
                    PhoneNumber = g.First().Patient.User.PhoneNumber,
                    DateOfBirth = g.First().Patient.User.DateOfBirth,
                    Visits = g.Count(),
                    LastVisit = g.Max(a => a.StartDateTime)

                })
                .AsQueryable();

            var rows = await result
                .OrderByDescending(i => i.LastVisit)
                .Skip(page * 9)
                .Take(9)
                .ToListAsync();
            var total = await result.CountAsync();
            return new PaginationDto<PatientsDataTableResponseDto>
            {
                Rows = rows,
                TotalCount = total,
            };

        }

        public async Task<PaginationDto<DoctorsDataTableResponseDto>> GetDataTableDoctors(int page, Guid institutionId)
        {
            var result = _context.InstitutionUsers
                .Where(d => d.InstitutionId == institutionId && d.User.Role == UserType.Doctor)
                .Select(d => new DoctorsDataTableResponseDto
                {
                    Id = d.UserId,
                    DoctorName = $"{d.User.FirstName} {d.User.LastName}",
                    PhoneNumber = d.User.PhoneNumber,
                    CreatedAt = d.User.CreatedAt,
                    Specialization = d.User.Doctor.DoctorSpecialties
                        .Select(ds => ds.InstitutionService.Specialty.Name)
                        .FirstOrDefault(),
                    YearsOfExperience = d.User.Doctor.YearsOfExperience,
                    Status = d.User.IsActive,

                });

            var rows = await result
                .OrderByDescending(d => d.CreatedAt)
                .Skip(page * 9)
                .Take(9)
                .ToListAsync();
            var total = await result.CountAsync();
            return new PaginationDto<DoctorsDataTableResponseDto>
            {
                Rows = rows,
                TotalCount = total,
            };

        }


        public async Task<List<SpecialtyServicesResponseDto>> GetSpecialtyServices(Guid institutionId)
        {
            var response = await _context.InstitutionServices
                .Where(i => i.InstitutionId == institutionId && i.IsActive == true)
                .GroupBy(i => new 
                { 
                    i.SpecialtyId, 
                    i.Specialty.Name 
                })
                .Select(g => new SpecialtyServicesResponseDto
                {
                    SpecialtyId = g.Key.SpecialtyId,
                    SpecialtyName = g.Key.Name,
                    InstitutionServices = g.Select(s => new InstitutionServiceDto
                    {
                        Id = s.Id,
                        ServiceId = s.ServiceId,
                        Name = s.Service.Name,
                        Price = s.Price,
                        Duration = s.Duration
                    }).ToList()
                })
                .ToListAsync();
            return response;
        }

        public async Task<bool> AddService(AddServiceRequestDto request)
        {
            var services = await _context.InstitutionServices
                .Where(i => i.InstitutionId == request.InstitutionId && i.SpecialtyId == request.SpecialtyId)
                .ToListAsync();

            foreach (Guid serviceId in request.Services)
            {
                var existingService = services.FirstOrDefault(s => s.ServiceId == serviceId);
                if (existingService != null)
                {
                   existingService.IsActive = true;
                    _context.InstitutionServices.Update(existingService);
                }

                else
                {
                    var obj = new InstitutionService
                    {
                        Id = Guid.NewGuid(),
                        InstitutionId = request.InstitutionId,
                        SpecialtyId = request.SpecialtyId,
                        ServiceId = serviceId,
                        IsActive = true,
                    };
                    _context.InstitutionServices.Add(obj);
                }
            }

            var result = await _context.SaveChangesAsync();
            return result > 0;

        }
        public async Task<bool> EditDataService(EditDataServiceRequestDto request)
        {
            var response = await _context.InstitutionServices
                .Where(i => i.Id == request.InstitutionServiceId)
                .FirstOrDefaultAsync();

                response.Price = request.Price;
                response.Duration = request.Duration;
                _context.InstitutionServices.Update(response);
                return (await _context.SaveChangesAsync()) > 0;
            
        }
        public async Task<bool> DeleteService(Guid institutionServiceId)
        {
            var response = await _context.InstitutionServices
                .Where(i => i.Id == institutionServiceId)
                .FirstOrDefaultAsync ();
            if(response != null)
            {
                response.IsActive = false;
                _context.InstitutionServices.Update(response);
              
            }
            return (await _context.SaveChangesAsync()) > 0;

        }

        public async Task<bool> DeleteSpecialty(DeleteSpecialtyRequestDto request)
        {
           
            var response = await _context.InstitutionServices
                .Where(i => i.InstitutionId == request.InstitutionId && i.SpecialtyId == request.SpecialtyId)
                .ToListAsync();
            if(response.Any())
            {
               foreach(var item in response)
                {
                    item.IsActive = false;
                }
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<List<SpecialtyDto>> GetSpecialtiesAsync(Guid institutionId)
        {
            var specialties = await _context.InstitutionServices
                .Where(i => i.InstitutionId == institutionId && i.IsActive == true)
                .Select(i => new SpecialtyDto
                {
                    Id = i.Specialty.Id,
                    Name = i.Specialty.Name,
                })
                .Distinct()
                .ToListAsync();
            return specialties;
        }

        public async Task<List<ServiceSelectDto>> GetServicesAsync(Guid institutionId)
        {
            var services = await _context.InstitutionServices
                .Where(i => i.InstitutionId == institutionId && i.IsActive == true)
                .Select(i => new ServiceSelectDto
                {
                    Id = i.Service.Id,
                    Name = i.Service.Name,
                })
                .Distinct()
                .ToListAsync();
            return services;
        }

        public async Task<InstitutionDetailsResponse> GetInstitutionDetailsAsync(Guid institutionId)
        {
            var response = await _context.Institutions
                .Where(i => i.Id == institutionId)
                .Select(x => new InstitutionDetailsResponse
                {
                    InstitutionId = x.Id,
                    InstitutionName = x.Name,
                    Rating = Math.Round(x.Appointments
                                .Where(a => a.Review != null)
                                .Select(a => (double?)a.Review.Rating)
                                .Average() ?? 0.0,
                                2),
                    TotalReviews = x.Appointments.Count(a => a.Review != null),
                    Address = x.Address.Country + ", " + x.Address.City + ", " + x.Address.Street + ", " + x.Address.Number,
                    Doctors = x.InstitutionUsers
                                .Where(iu => iu.User.Role == UserType.Doctor)
                                .Select(d => new DoctorPreview
                                {
                                    Id = d.UserId,
                                    Name = d.User.FirstName + " " + d.User.LastName,
                                    Rating = Math.Round(d.User.Doctor.Appointments
                                                .Where(r => r.Review != null)
                                                .Select(r => (double?)r.Review.Rating)
                                                .Average() ?? 0.0,
                                                2),
                                    Specialties = d.User.Doctor.DoctorSpecialties
                                                .Select(ds => ds.InstitutionService.Specialty.Name)
                                                .Distinct()
                                                .ToList()

                                }).ToList()
                }).FirstOrDefaultAsync();

            return response;
        }

        public async Task<List<AvailabilityDoctorsResponseDto>> GetDoctorsAvailabilityAsync(GetDoctorsWithSlotsRequestDto request)
        {
            var response = await _context.DoctorSpecialties
                .Where(d => d.InstitutionService.InstitutionId == request.InstitutionId &&
                d.InstitutionService.SpecialtyId == request.SpecialtyId &&
                d.InstitutionService.ServiceId == request.ServiceId
                )
                .Select(x => new AvailabilityDoctorsResponseDto
                {
                    Id = x.Doctor.UserId,
                    Name = x.Doctor.User.FirstName + " " + x.Doctor.User.LastName,
                    DoctorSpecialties = x.Doctor.DoctorSpecialties
                                                            .Select(ds => new SpecialtyDto
                                                            {
                                                                Id = ds.InstitutionService.Specialty.Id,
                                                                Name = ds.InstitutionService.Specialty.Name,
                                                            })
                                                            .ToList(),
                    Rating = Math.Round(x.Doctor.Appointments
                                        .Where(a => a.Review != null)
                                        .Select(a => (double?)a.Review.Rating)
                                        .Average() ?? 0.0,
                                        2),
                    TotalReviews = x.Doctor.Appointments.Count(a => a.Review != null),

                })
                .ToListAsync() ;
            response = response.DistinctBy(x => x.Id).ToList();
            foreach (var doctor in response)
            {
                doctor.DoctorSpecialties = doctor.DoctorSpecialties
                    .DistinctBy(s => s.Id)
                    .ToList();
            }
            var service = await _context.InstitutionServices
                .FirstOrDefaultAsync(s =>
                    s.InstitutionId == request.InstitutionId &&
                    s.ServiceId == request.ServiceId);

            if (service == null)
                return [];

            foreach (var item in response)
            {
                List<AvailableSlotDto> slots = await GetScheduleForDoctor(request, item.Id, service);
                item.SlotsAvailable = slots;
            }
            List<AvailabilityDoctorsResponseDto> filteredResponse = response
                .Where(r => r.SlotsAvailable != null && r.SlotsAvailable.Count > 0)
                .ToList();
            return filteredResponse;
        }

        public async Task<List<DoctorInfoTabResponse>> GetDoctorsInfoTabAsync(Guid institutionId)
        {
            var response = await _context.DoctorSpecialties
                .Where(d => d.InstitutionService.InstitutionId == institutionId)
                .Select(x => new DoctorInfoTabResponse
                {
                    Id = x.Doctor.UserId,
                    Name = x.Doctor.User.FirstName + " " + x.Doctor.User.LastName,
                    DoctorSpecialties = x.Doctor.DoctorSpecialties
                                                            .Select(ds => new SpecialtyDto
                                                            {
                                                                Id = ds.InstitutionService.Specialty.Id,
                                                                Name = ds.InstitutionService.Specialty.Name,
                                                            })
                                                            .ToList(),
                    Rating = Math.Round(x.Doctor.Appointments
                                        .Where(a => a.Review != null)
                                        .Select(a => (double?)a.Review.Rating)
                                        .Average() ?? 0.0,
                                        2),
                    TotalReviews = x.Doctor.Appointments.Count(a => a.Review != null),
                })
                .ToListAsync();
            response = response.Select(x => new DoctorInfoTabResponse(x, x.DoctorSpecialties.DistinctBy(s => s.Id).ToList())).DistinctBy(x => x.Id).ToList();
            return response;
        }

        public async Task<AvailableSlotsDoctorResponseDto> GetAvailableSlotsByDoctorAsync(GetDoctorsWithSlotsRequestDto request)
        {
        
            var service = await _context.InstitutionServices
                .FirstOrDefaultAsync(s =>
                    s.InstitutionId == request.InstitutionId &&
                    s.ServiceId == request.ServiceId);

            if (service == null)
                return null;

                List<AvailableSlotDto> slots = await GetScheduleForDoctor(request, request.DoctorId.Value, service);
            var response = new AvailableSlotsDoctorResponseDto
            {
                DoctorId = request.DoctorId.Value,
                SlotsAvailable = slots
            };
          
            return response;
        }

        public async Task<List<InstitutionDetailsResponse>> GetInstitutionsBySpecialtyAndServiceAsync(string? specialty, string? service, double? latitude, double? longitude, string? doctorName, string? institutionName)
        {
            var query = _context.InstitutionServices
                .Where(i => i.IsActive == true && i.Institution.Active == true);

            if (specialty != null)
                query = query.Where(i => i.Specialty.Name.ToLower() == specialty.ToLower());

            if (service != null)
                query = query.Where(i => i.Service.Name.ToLower() == service.ToLower());

            if (doctorName != null)
            {
                var parts = doctorName.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                query = query.Where(i => i.DoctorSpecialties.Any(ds =>
                    parts.All(part =>
                        ds.Doctor.User.FirstName.ToLower().Contains(part) ||
                        ds.Doctor.User.LastName.ToLower().Contains(part))));
            }

            if (institutionName != null)
                query = query.Where(i => i.Institution.Name.ToLower().Contains(institutionName.ToLower()));

            var result = await query
                .Select(i => i.Institution)
                .Distinct()
                .Select(x => new InstitutionDetailsResponse
                {
                    InstitutionId = x.Id,
                    InstitutionName = x.Name,
                    Rating = Math.Round(x.Appointments
                                .Where(a => a.Review != null)
                                .Select(a => (double?)a.Review.Rating)
                                .Average() ?? 0.0, 2),
                    TotalReviews = x.Appointments.Count(a => a.Review != null),
                    Address = x.Address.Country + ", " + x.Address.City + ", " + x.Address.Street + ", " + x.Address.Number,
                    Latitude = x.Address.Latitude == 0 && x.Address.Longitude == 0 ? null : (double?)x.Address.Latitude,
                    Longitude = x.Address.Latitude == 0 && x.Address.Longitude == 0 ? null : (double?)x.Address.Longitude,
                })
                .ToListAsync();

            if (latitude.HasValue && longitude.HasValue)
            {
                foreach (var clinic in result)
                {
                    if (clinic.Latitude.HasValue && clinic.Longitude.HasValue)
                    {
                        var dLat = (clinic.Latitude.Value - latitude.Value) * 111.0;
                        var dLng = (clinic.Longitude.Value - longitude.Value) * 111.0 * Math.Cos(latitude.Value * Math.PI / 180);
                        clinic.Distance = Math.Round(Math.Sqrt(dLat * dLat + dLng * dLng), 2);
                    }
                }
                return result.OrderBy(x => x.Distance ?? double.MaxValue).ToList();
            }

            return result.OrderByDescending(x => x.Rating).ToList();
        }

        private string GenerateInstitutionCode (string institutionName)
        {
            var cleanName = Regex.Replace(institutionName.ToUpper(), @"[^A-Z0-9]", "");
            var prefix = cleanName.Length >= 3 ? cleanName.Substring(0, 3) : cleanName;
            const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var randomPart = Nanoid.Generate(alphabet, 5);
            return $"{prefix}-{randomPart}";
        }
    }
}
