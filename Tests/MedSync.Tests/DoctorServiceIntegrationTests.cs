using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services;
using Microsoft.EntityFrameworkCore;

namespace MedSync.IntegrationTests
{
    public class DoctorServiceIntegrationTests
    {
        [Fact]
        public async Task GetAvailableSlotsAsync_WhenAppointmentOverlaps_ReturnsOnlyFreeSlot()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);

            var doctorId = Guid.NewGuid();
            var institutionId = Guid.NewGuid();
            var institutionServiceId = Guid.NewGuid();
            var monday = NextDayOfWeek(DateTime.UtcNow.Date, DayOfWeek.Monday);

            context.UserSchedules.Add(
                new UserSchedule
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = (int)DayOfWeek.Monday,
                    StartTime = new TimeOnly(9, 0),
                    EndTime = new TimeOnly(10, 0),
                    UserId = doctorId,
                    InstitutionId = institutionId,
                    CreatedByUserId = doctorId,
                }
            );

            context.Appointments.Add(
                new Appointment
                {
                    Id = Guid.NewGuid(),
                    InstitutionServiceId = institutionServiceId,
                    PatientUserId = Guid.NewGuid(),
                    DoctorUserId = doctorId,
                    InstitutionId = institutionId,
                    StartDateTime = monday.AddHours(9).AddMinutes(30),
                    EndDateTime = monday.AddHours(10),
                    TotalPrice = 170m,
                    Status = AppointmentStatusEnumType.Confirmed,
                    CreatedAt = DateTime.UtcNow,
                    ReminderSent = false,
                }
            );

            await context.SaveChangesAsync();

            var sut = new DoctorService(context);

            // Act
            var slots = await sut.GetAvailableSlotsAsync(
                doctorId,
                institutionId,
                monday,
                monday,
                30
            );

            // Assert
            Assert.Single(slots);
            Assert.Equal(monday.AddHours(9), slots[0].Start);
            Assert.Equal(monday.AddHours(9.5), slots[0].End);
        }

        [Fact]
        public async Task GetAvailableSlotsAsync_WhenRequestedDayIsNotWorkingDay_ReturnsEmptyList()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);

            var doctorId = Guid.NewGuid();
            var institutionId = Guid.NewGuid();
            var tuesday = NextDayOfWeek(DateTime.UtcNow.Date, DayOfWeek.Tuesday);

            context.UserSchedules.Add(
                new UserSchedule
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = (int)DayOfWeek.Monday,
                    StartTime = new TimeOnly(9, 0),
                    EndTime = new TimeOnly(10, 0),
                    UserId = doctorId,
                    InstitutionId = institutionId,
                    CreatedByUserId = doctorId,
                }
            );

            await context.SaveChangesAsync();

            var sut = new DoctorService(context);

            // Act
            var slots = await sut.GetAvailableSlotsAsync(
                doctorId,
                institutionId,
                tuesday,
                tuesday,
                30
            );

            // Assert
            Assert.Empty(slots);
        }

        [Fact]
        public async Task GetAvailableSlotsAsync_WhenNoAppointmentsExist_ReturnsAllSlots()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MedSyncContext>()
                .UseInMemoryDatabase($"medsync-integration-{Guid.NewGuid()}")
                .Options;

            await using var context = new MedSyncContext(options);

            var doctorId = Guid.NewGuid();
            var institutionId = Guid.NewGuid();
            var monday = NextDayOfWeek(DateTime.UtcNow.Date, DayOfWeek.Monday);

            context.UserSchedules.Add(
                new UserSchedule
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = (int)DayOfWeek.Monday,
                    StartTime = new TimeOnly(9, 0),
                    EndTime = new TimeOnly(10, 0),
                    UserId = doctorId,
                    InstitutionId = institutionId,
                    CreatedByUserId = doctorId,
                }
            );

            await context.SaveChangesAsync();

            var sut = new DoctorService(context);

            // Act
            var slots = await sut.GetAvailableSlotsAsync(
                doctorId,
                institutionId,
                monday,
                monday,
                30
            );

            // Assert
            Assert.Equal(2, slots.Count);
            Assert.Equal(monday.AddHours(9), slots[0].Start);
            Assert.Equal(monday.AddHours(9.5), slots[0].End);
            Assert.Equal(monday.AddHours(9.5), slots[1].Start);
            Assert.Equal(monday.AddHours(10), slots[1].End);
        }

        private static DateTime NextDayOfWeek(DateTime startDate, DayOfWeek targetDay)
        {
            var offset = ((int)targetDay - (int)startDate.DayOfWeek + 7) % 7;
            return startDate.AddDays(offset);
        }
    }   
}
