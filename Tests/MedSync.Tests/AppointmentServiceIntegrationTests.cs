using MedSync.DataLayer.DTOs.Appointments;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace MedSync.IntegrationTests
{
    public class AppointmentServiceIntegrationTests
    {
        [Fact]
        public async Task GetCalendarAppointmentsByDoctorAsync_WhenAppointmentsExist_ReturnsOnlyDoctorAppointmentsInInterval()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-appointments-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);

            var institutionId = Guid.NewGuid();
            var doctorId = Guid.NewGuid();
            var otherDoctorId = Guid.NewGuid();
            var inRangeDate = DateTime.UtcNow.Date.AddDays(1).AddHours(10);
            var outOfRangeDate = DateTime.UtcNow.Date.AddDays(10).AddHours(10);

            var serviceId = Guid.NewGuid();
            var specialtyId = Guid.NewGuid();
            var institutionServiceId = Guid.NewGuid();

            context.Services.Add(new Service { Id = serviceId, Name = "Initial Consultation" });
            context.Specialties.Add(new Specialty { Id = specialtyId, Name = "Cardiology" });
            context.InstitutionServices.Add(
                new InstitutionService
                {
                    Id = institutionServiceId,
                    InstitutionId = institutionId,
                    SpecialtyId = specialtyId,
                    ServiceId = serviceId,
                    Duration = 30,
                    Price = 150,
                    IsActive = true,
                }
            );

            var patientAId = Guid.NewGuid();
            var patientBId = Guid.NewGuid();
            var patientCId = Guid.NewGuid();
            context.UnregisteredPatients.AddRange(
                new UnregisteredPatient
                {
                    Id = patientAId,
                    FirstName = "Ana",
                    LastName = "Pop",
                    PhoneNumber = "0700000001",
                    CreatedAt = DateTime.UtcNow,
                },
                new UnregisteredPatient
                {
                    Id = patientBId,
                    FirstName = "Mihai",
                    LastName = "Ionescu",
                    PhoneNumber = "0700000002",
                    CreatedAt = DateTime.UtcNow,
                },
                new UnregisteredPatient
                {
                    Id = patientCId,
                    FirstName = "Elena",
                    LastName = "Marin",
                    PhoneNumber = "0700000003",
                    CreatedAt = DateTime.UtcNow,
                }
            );

            context.Appointments.AddRange(
                new Appointment
                {
                    Id = Guid.NewGuid(),
                    InstitutionServiceId = institutionServiceId,
                    UnregisteredPatientId = patientAId,
                    DoctorUserId = doctorId,
                    InstitutionId = institutionId,
                    StartDateTime = inRangeDate,
                    EndDateTime = inRangeDate.AddMinutes(30),
                    TotalPrice = 150,
                    Status = AppointmentStatusEnumType.Confirmed,
                    CreatedAt = DateTime.UtcNow,
                    ReminderSent = false,
                },
                new Appointment
                {
                    Id = Guid.NewGuid(),
                    InstitutionServiceId = institutionServiceId,
                    UnregisteredPatientId = patientBId,
                    DoctorUserId = otherDoctorId,
                    InstitutionId = institutionId,
                    StartDateTime = inRangeDate,
                    EndDateTime = inRangeDate.AddMinutes(30),
                    TotalPrice = 150,
                    Status = AppointmentStatusEnumType.Confirmed,
                    CreatedAt = DateTime.UtcNow,
                    ReminderSent = false,
                },
                new Appointment
                {
                    Id = Guid.NewGuid(),
                    InstitutionServiceId = institutionServiceId,
                    UnregisteredPatientId = patientCId,
                    DoctorUserId = doctorId,
                    InstitutionId = institutionId,
                    StartDateTime = outOfRangeDate,
                    EndDateTime = outOfRangeDate.AddMinutes(30),
                    TotalPrice = 150,
                    Status = AppointmentStatusEnumType.Confirmed,
                    CreatedAt = DateTime.UtcNow,
                    ReminderSent = false,
                }
            );

            await context.SaveChangesAsync();

            var sut = CreateAppointmentsService(context);

            var request = new CalendarAppointmentsRequestDto
            {
                InstitutionId = institutionId,
                DoctorId = doctorId,
                From = inRangeDate.Date,
                To = inRangeDate.Date,
            };

            // Act
            var result = await sut.GetCalendarAppointmentsByDoctorAsync(request);

            // Assert
            Assert.Single(result);
            Assert.Equal("Initial Consultation", result[0].Service);
            Assert.Equal("Ana Pop", result[0].PatientName);
            Assert.Equal(inRangeDate, result[0].StartDateTimeUtc);
            Assert.Equal(inRangeDate.AddMinutes(30), result[0].EndDateTimeUtc);
            Assert.Equal(30, result[0].Duration);
        }

        [Fact]
        public async Task GetCalendarAppointmentsByDoctorAsync_WhenNoAppointmentsInInterval_ReturnsEmptyList()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-appointments-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);

            var institutionId = Guid.NewGuid();
            var doctorId = Guid.NewGuid();
            var serviceId = Guid.NewGuid();
            var specialtyId = Guid.NewGuid();
            var institutionServiceId = Guid.NewGuid();
            var outsideDate = DateTime.UtcNow.Date.AddDays(10).AddHours(10);

            context.Services.Add(new Service { Id = serviceId, Name = "Initial Consultation" });
            context.Specialties.Add(new Specialty { Id = specialtyId, Name = "Cardiology" });
            context.InstitutionServices.Add(
                new InstitutionService
                {
                    Id = institutionServiceId,
                    InstitutionId = institutionId,
                    SpecialtyId = specialtyId,
                    ServiceId = serviceId,
                    Duration = 30,
                    Price = 150,
                    IsActive = true,
                }
            );

            var patientId = Guid.NewGuid();
            context.UnregisteredPatients.Add(
                new UnregisteredPatient
                {
                    Id = patientId,
                    FirstName = "Ana",
                    LastName = "Pop",
                    PhoneNumber = "0700000011",
                    CreatedAt = DateTime.UtcNow,
                }
            );

            context.Appointments.Add(
                new Appointment
                {
                    Id = Guid.NewGuid(),
                    InstitutionServiceId = institutionServiceId,
                    UnregisteredPatientId = patientId,
                    DoctorUserId = doctorId,
                    InstitutionId = institutionId,
                    StartDateTime = outsideDate,
                    EndDateTime = outsideDate.AddMinutes(30),
                    TotalPrice = 150,
                    Status = AppointmentStatusEnumType.Confirmed,
                    CreatedAt = DateTime.UtcNow,
                    ReminderSent = false,
                }
            );

            await context.SaveChangesAsync();

            var sut = CreateAppointmentsService(context);
            var request = new CalendarAppointmentsRequestDto
            {
                InstitutionId = institutionId,
                DoctorId = doctorId,
                From = DateTime.UtcNow.Date,
                To = DateTime.UtcNow.Date,
            };

            // Act
            var result = await sut.GetCalendarAppointmentsByDoctorAsync(request);

            // Assert
            Assert.Empty(result);
        }

        [Fact]
        public async Task EditInfoAppointment_WhenAppointmentExists_UpdatesStatusAndTotalPrice()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-appointments-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);

            var appointmentId = Guid.NewGuid();
            context.Appointments.Add(
                new Appointment
                {
                    Id = appointmentId,
                    InstitutionServiceId = Guid.NewGuid(),
                    PatientUserId = Guid.NewGuid(),
                    DoctorUserId = Guid.NewGuid(),
                    InstitutionId = Guid.NewGuid(),
                    StartDateTime = DateTime.UtcNow.AddDays(1),
                    EndDateTime = DateTime.UtcNow.AddDays(1).AddMinutes(30),
                    TotalPrice = 100,
                    Status = AppointmentStatusEnumType.Confirmed,
                    CreatedAt = DateTime.UtcNow,
                    ReminderSent = false,
                }
            );
            await context.SaveChangesAsync();

            var sut = CreateAppointmentsService(context);

            var request = new EditInfoAppointmentRequest
            {
                Id = appointmentId,
                TotalPrice = 250,
                Status = AppointmentStatusEnumType.Completed,
            };

            // Act
            var updated = await sut.EditInfoAppointment(request);

            // Assert
            Assert.True(updated);
            var saved = await context.Appointments.FirstAsync(a => a.Id == appointmentId);
            Assert.Equal(250, saved.TotalPrice);
            Assert.Equal(AppointmentStatusEnumType.Completed, saved.Status);
        }

        [Fact]
        public async Task AddAppointment_WhenPatientAlreadyHasOverlappingAppointment_ThrowsPatientConflict()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-appointments-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);

            if (!File.Exists("EmailTemplates.json"))
                File.WriteAllText("EmailTemplates.json", "{}");

            var institutionId = Guid.NewGuid();
            var doctorAId = Guid.NewGuid();
            var doctorBId = Guid.NewGuid();
            var patientId = Guid.NewGuid();
            var serviceId = Guid.NewGuid();
            var specialtyId = Guid.NewGuid();
            var institutionServiceId = Guid.NewGuid();

            context.Services.Add(new Service { Id = serviceId, Name = "Initial Consultation" });
            context.Specialties.Add(new Specialty { Id = specialtyId, Name = "Cardiology" });
            context.InstitutionServices.Add(
                new InstitutionService
                {
                    Id = institutionServiceId,
                    InstitutionId = institutionId,
                    SpecialtyId = specialtyId,
                    ServiceId = serviceId,
                    Duration = 30,
                    Price = 150,
                    IsActive = true,
                }
            );

            var startTime = DateTime.UtcNow.Date.AddDays(1).AddHours(10);

            context.Appointments.Add(
                new Appointment
                {
                    Id = Guid.NewGuid(),
                    InstitutionServiceId = institutionServiceId,
                    PatientUserId = patientId,
                    DoctorUserId = doctorAId,
                    InstitutionId = institutionId,
                    StartDateTime = startTime,
                    EndDateTime = startTime.AddMinutes(30),
                    TotalPrice = 150,
                    Status = AppointmentStatusEnumType.Confirmed,
                    CreatedAt = DateTime.UtcNow,
                    ReminderSent = false,
                }
            );

            await context.SaveChangesAsync();

            var sut = CreateAppointmentsService(context);

            var request = new AddAppointmentRequestDto
            {
                InstitutionId = institutionId,
                DoctorId = doctorBId,
                PatientId = patientId,
                SpecialtyId = specialtyId,
                ServiceId = serviceId,
                startTime = startTime,
            };

            // Act
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(
                () => sut.AddAppointment(request)
            );

            // Assert
            Assert.Equal("PATIENT_CONFLICT", ex.Message);
            Assert.Equal(1, await context.Appointments.CountAsync());
        }

        private static AppointmentsService CreateAppointmentsService(MedSyncContext context)
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(
                    new Dictionary<string, string?> { ["MailerSend:ApiKey"] = "test-api-key" }
                )
                .Build();

            var mailer = new MailerSendService(config);
            return new AppointmentsService(context, mailer);
        }
    }
}
