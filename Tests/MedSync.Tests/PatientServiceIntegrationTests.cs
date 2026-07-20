using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.DTOs.Patient;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace MedSync.IntegrationTests
{
    public class PatientServiceIntegrationTests
    {
        [Fact]
        public async Task GetAppointmentHistoryAsync_WhenPatientHasOwnAndOthersAppointments_ReturnsOnlyOwn()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-patient-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);

            var patientAId = Guid.NewGuid();
            var patientBId = Guid.NewGuid();
            var doctorUserId = Guid.NewGuid();
            var institutionId = Guid.NewGuid();
            var addressId = Guid.NewGuid();
            var serviceId = Guid.NewGuid();
            var specialtyId = Guid.NewGuid();
            var institutionServiceId = Guid.NewGuid();

            context.Addresses.Add(
                new Address
                {
                    Id = addressId,
                    Country = "Romania",
                    City = "Bucharest",
                    Street = "Main",
                    Number = "10",
                    PostalCode = "010000",
                }
            );

            context.Users.AddRange(
                new User
                {
                    Id = doctorUserId,
                    Role = UserType.Doctor,
                    FirstName = "Ion",
                    LastName = "Doctor",
                    Email = "doctor@test.com",
                    PasswordHash = "hash",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                },
                new User
                {
                    Id = patientAId,
                    Role = UserType.Patient,
                    FirstName = "Ana",
                    LastName = "Patient",
                    Email = "patienta@test.com",
                    PasswordHash = "hash",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                },
                new User
                {
                    Id = patientBId,
                    Role = UserType.Patient,
                    FirstName = "Mihai",
                    LastName = "Patient",
                    Email = "patientb@test.com",
                    PasswordHash = "hash",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                }
            );

            context.Doctors.Add(
                new Doctor
                {
                    UserId = doctorUserId,
                    YearsOfExperience = 10,
                    MedicalLicenseNumber = "DOC-001",
                }
            );

            context.Patients.AddRange(
                new Patient { UserId = patientAId, Cnp = "1111111111111" },
                new Patient { UserId = patientBId, Cnp = "2222222222222" }
            );

            context.Institutions.Add(
                new Institution
                {
                    Id = institutionId,
                    Code = "INST-01",
                    Name = "MedSync Clinic",
                    AddressId = addressId,
                    CreatedAt = DateTime.UtcNow,
                    Active = true,
                    TaxIdentificationNumber = "RO123",
                }
            );

            context.Services.Add(new Service { Id = serviceId, Name = "Consultation" });
            context.Specialties.Add(new Specialty { Id = specialtyId, Name = "Cardiology" });
            context.InstitutionServices.Add(
                new InstitutionService
                {
                    Id = institutionServiceId,
                    InstitutionId = institutionId,
                    ServiceId = serviceId,
                    SpecialtyId = specialtyId,
                    Price = 200,
                    Duration = 30,
                    IsActive = true,
                }
            );

            var now = DateTime.UtcNow;
            context.Appointments.AddRange(
                new Appointment
                {
                    Id = Guid.NewGuid(),
                    InstitutionServiceId = institutionServiceId,
                    PatientUserId = patientAId,
                    DoctorUserId = doctorUserId,
                    InstitutionId = institutionId,
                    StartDateTime = now.AddDays(-2),
                    EndDateTime = now.AddDays(-2).AddMinutes(30),
                    TotalPrice = 200,
                    Status = AppointmentStatusEnumType.Completed,
                    CreatedAt = now,
                    ReminderSent = false,
                },
                new Appointment
                {
                    Id = Guid.NewGuid(),
                    InstitutionServiceId = institutionServiceId,
                    PatientUserId = patientBId,
                    DoctorUserId = doctorUserId,
                    InstitutionId = institutionId,
                    StartDateTime = now.AddDays(-1),
                    EndDateTime = now.AddDays(-1).AddMinutes(30),
                    TotalPrice = 200,
                    Status = AppointmentStatusEnumType.Completed,
                    CreatedAt = now,
                    ReminderSent = false,
                }
            );

            await context.SaveChangesAsync();

            var sut = CreatePatientService(context);

            // Act
            var history = await sut.GetAppointmentHistoryAsync(patientAId);

            // Assert
            Assert.Single(history);
            Assert.Equal("Ion Doctor", history[0].DoctorName);
            Assert.Equal("Cardiology", history[0].Specialty);
            Assert.Equal("Consultation", history[0].Service);
        }

        [Fact]
        public async Task GenerateSharedLinkAndGetActiveStatus_WhenValidRequest_ReturnsTokenAndActiveStatus()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-patient-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);
            var patientId = await SeedRegisteredPatientAsync(context);

            var sut = CreatePatientService(context);
            var request = new GenerateLinkRequestDto
            {
                PatientId = patientId,
                CareUnregisteredPatientId = null,
            };

            // Act
            var token = await sut.GenerateSharedLinkAsync(request);
            var activeStatus = await sut.GetActiveLinkStatusAsync(request);

            // Assert
            Assert.False(string.IsNullOrWhiteSpace(token));
            Assert.NotNull(activeStatus);
            Assert.Equal(token, activeStatus.Token);
            Assert.True(activeStatus.RemainingSeconds > 0);
        }

        [Fact]
        public async Task RevokeSharedLinkAsync_WhenActiveLinkExists_DisablesLinkAndStatusBecomesNull()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-patient-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);
            var patientId = await SeedRegisteredPatientAsync(context);

            var sut = CreatePatientService(context);
            var request = new GenerateLinkRequestDto
            {
                PatientId = patientId,
                CareUnregisteredPatientId = null,
            };

            await sut.GenerateSharedLinkAsync(request);

            // Act
            var revoked = await sut.RevokeSharedLinkAsync(request);
            var activeStatusAfterRevoke = await sut.GetActiveLinkStatusAsync(request);

            // Assert
            Assert.True(revoked);
            Assert.Null(activeStatusAfterRevoke);
            Assert.All(context.SharedLinks, x => Assert.False(x.IsActive));
        }

        [Fact]
        public async Task LeaveReviewAsync_WhenAppointmentCompletedAndOwnedByPatient_ReturnsTrue()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-patient-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);
            var patientId = await SeedRegisteredPatientAsync(context);

            var appointmentId = Guid.NewGuid();
            context.Appointments.Add(
                new Appointment
                {
                    Id = appointmentId,
                    InstitutionServiceId = Guid.NewGuid(),
                    PatientUserId = patientId,
                    DoctorUserId = Guid.NewGuid(),
                    InstitutionId = Guid.NewGuid(),
                    StartDateTime = DateTime.UtcNow.AddDays(-1),
                    EndDateTime = DateTime.UtcNow.AddDays(-1).AddMinutes(30),
                    TotalPrice = 120,
                    Status = AppointmentStatusEnumType.Completed,
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    ReminderSent = false,
                }
            );
            await context.SaveChangesAsync();

            var sut = CreatePatientService(context);
            var request = new LeaveReviewRequestDto
            {
                PatientId = patientId,
                AppointmentId = appointmentId,
                Rating = 5,
                Comment = "Great consultation",
            };

            // Act
            var result = await sut.LeaveReviewAsync(request);

            // Assert
            Assert.True(result);
            var review = await context.Reviews.FirstOrDefaultAsync(r => r.AppointmentId == appointmentId);
            Assert.NotNull(review);
            Assert.Equal(5, review.Rating);
        }

        [Fact]
        public async Task LeaveReviewAsync_WhenAppointmentIsNotCompleted_ReturnsFalse()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-patient-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);
            var patientId = await SeedRegisteredPatientAsync(context);

            var appointmentId = Guid.NewGuid();
            context.Appointments.Add(
                new Appointment
                {
                    Id = appointmentId,
                    InstitutionServiceId = Guid.NewGuid(),
                    PatientUserId = patientId,
                    DoctorUserId = Guid.NewGuid(),
                    InstitutionId = Guid.NewGuid(),
                    StartDateTime = DateTime.UtcNow.AddDays(1),
                    EndDateTime = DateTime.UtcNow.AddDays(1).AddMinutes(30),
                    TotalPrice = 120,
                    Status = AppointmentStatusEnumType.Confirmed,
                    CreatedAt = DateTime.UtcNow,
                    ReminderSent = false,
                }
            );
            await context.SaveChangesAsync();

            var sut = CreatePatientService(context);
            var request = new LeaveReviewRequestDto
            {
                PatientId = patientId,
                AppointmentId = appointmentId,
                Rating = 5,
                Comment = "Should not be accepted",
            };

            // Act
            var result = await sut.LeaveReviewAsync(request);

            // Assert
            Assert.False(result);
            Assert.Empty(context.Reviews);
        }

        private static PatientService CreatePatientService(MedSyncContext context)
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(
                    new Dictionary<string, string?> { ["SharedLinks:SecretKey"] = Convert.ToBase64String(Guid.NewGuid().ToByteArray().Concat(Guid.NewGuid().ToByteArray()).ToArray()) }
                )
                .Build();
            return new PatientService(context, config);
        }

        private static async Task<Guid> SeedRegisteredPatientAsync(MedSyncContext context)
        {
            var patientId = Guid.NewGuid();

            context.Users.Add(
                new User
                {
                    Id = patientId,
                    Role = UserType.Patient,
                    FirstName = "Seed",
                    LastName = "Patient",
                    Email = $"patient-{patientId}@test.com",
                    PasswordHash = "hash",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                }
            );
            context.Patients.Add(new Patient { UserId = patientId, Cnp = "3333333333333" });

            await context.SaveChangesAsync();
            return patientId;
        }
    }
}
