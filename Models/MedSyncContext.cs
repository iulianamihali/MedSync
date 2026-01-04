using System;
using System.Collections.Generic;
using MedSync.DataLayer.Enums;
using Microsoft.EntityFrameworkCore;

namespace MedSync.Models;

public partial class MedSyncContext : DbContext
{
    public MedSyncContext()
    {
    }
 
    public MedSyncContext(DbContextOptions<MedSyncContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Address> Addresses { get; set; }

    public virtual DbSet<Appointment> Appointments { get; set; }

    public virtual DbSet<AssociatedUser> AssociatedUsers { get; set; }

    public virtual DbSet<Doctor> Doctors { get; set; }

    public virtual DbSet<Institution> Institutions { get; set; }

    public virtual DbSet<InstitutionUser> InstitutionUsers { get; set; }

    public virtual DbSet<MedicalRecord> MedicalRecords { get; set; }

    public virtual DbSet<Patient> Patients { get; set; }

    public virtual DbSet<PatientAccess> PatientAccesses { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserSchedule> UserSchedules { get; set; }
    public virtual DbSet<SupportIssues> SupportIssues { get; set; }
    public virtual DbSet<InstitutionRequests> InstitutionRequests { get; set; }
    public virtual DbSet<DoctorRequests> DoctorRequests { get; set; }
    public virtual DbSet<Specialty> Specialties { get; set; }
    public virtual DbSet<Service> Services { get; set; }
    public virtual DbSet<InstitutionService> InstitutionServices { get; set; }
    public virtual DbSet<DoctorSpecialty> DoctorSpecialties { get; set; }
    public virtual DbSet<UnregisteredPatient> UnregisteredPatients { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Address>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Country).HasMaxLength(100);
            entity.Property(e => e.Number).HasMaxLength(20);
            entity.Property(e => e.PostalCode).HasMaxLength(20);
            entity.Property(e => e.Street).HasMaxLength(100);
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasIndex(e => new { e.DoctorId, e.StartDateTime }, "IX_Appointments_Doctor_StartDateTime").IsUnique();

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Status).HasConversion(x => (int)x, x => (AppointmentStatusEnumType)x).IsRequired();
            entity.Property(e => e.ReferralCode)
                .HasMaxLength(50);
            entity.HasOne(d => d.Doctor).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Appointments_DoctorId");
            entity.HasOne(d => d.Patient).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.PatientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Appointments_PatientId");
            entity.HasOne(d => d.InstitutionService).WithMany(p => p.Appointments)
               .HasForeignKey(d => d.InstitutionServiceId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("FK_Appointments_InstitutionServiceId");
            entity.HasOne(d => d.UnregisteredPatient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(d => d.UnregisteredPatientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Appointments_UnregisteredPatientId");

        });

        modelBuilder.Entity<AssociatedUser>(entity =>
        {
            entity.HasKey(e => new { e.PrimaryUserId, e.AssociatedUserId });

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Relationship).HasMaxLength(100);

            entity.HasOne(d => d.AssociatedUserNavigation).WithMany(p => p.AssociatedUsers)
                .HasForeignKey(d => d.AssociatedUserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AssociatedUsers_Associated");

            entity.HasOne(d => d.PrimaryUser).WithMany(p => p.AssociatedUsers)
                .HasForeignKey(d => d.PrimaryUserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AssociatedUsers_Primary");
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(e => e.UserId);

            entity.HasIndex(e => e.MedicalLicenseNumber, "UQ__Doctors__33143F83FC65D259").IsUnique();

            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.MedicalLicenseNumber).HasMaxLength(50);
            entity.Property(e => e.UniversityName).HasMaxLength(255);

            entity.HasOne(d => d.User).WithOne(p => p.Doctor)
                .HasForeignKey<Doctor>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Doctors_UserId");
        });

        modelBuilder.Entity<Institution>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Code).HasMaxLength(25);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.TaxIdentificationNumber).HasMaxLength(25);

            entity.HasOne(d => d.Address).WithMany(p => p.Institutions)
                .HasForeignKey(d => d.AddressId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Institutions_AddressId");
        });

        modelBuilder.Entity<InstitutionUser>(entity =>
        {
            entity.HasKey(e => new { e.InstitutionId, e.UserId });

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Institution).WithMany(p => p.InstitutionUsers)
                .HasForeignKey(d => d.InstitutionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_InstitutionUsers_InstitutionId");

            entity.HasOne(d => d.User).WithMany(p => p.InstitutionUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_InstitutionUsers_UserId");
        });

        modelBuilder.Entity<MedicalRecord>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.Doctor).WithMany(p => p.MedicalRecords)
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MedicalRecords_DoctorId");

            entity.HasOne(d => d.Patient).WithMany(p => p.MedicalRecords)
                .HasForeignKey(d => d.PatientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MedicalRecords_PatientId");
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(e => e.UserId);

            entity.HasIndex(e => e.Cnp, "UQ__Patients__C1FF677D6D763162").IsUnique();

            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.Cnp)
                .HasMaxLength(13)
                .HasColumnName("CNP");
            entity.Property(e => e.EmergencyContactName).HasMaxLength(100);
            entity.Property(e => e.EmergencyContactPhone).HasMaxLength(20);
            entity.Property(e => e.InsuranceCardNumber).HasMaxLength(50);

            entity.HasOne(d => d.User).WithOne(p => p.Patient)
                .HasForeignKey<Patient>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Patients_UserId");
        });

        modelBuilder.Entity<PatientAccess>(entity =>
        {
            entity.HasKey(e => new { e.OwnerPatientId, e.ViewerId });

            entity.ToTable("PatientAccess");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Scope)
                .HasMaxLength(50)
                .HasDefaultValue("all");

            entity.HasOne(d => d.OwnerPatient).WithMany(p => p.PatientAccesses)
                .HasForeignKey(d => d.OwnerPatientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PatientAccess_Owner");

            entity.HasOne(d => d.Viewer).WithMany(p => p.PatientAccesses)
                .HasForeignKey(d => d.ViewerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PatientAccess_Viewer");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Comment).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Doctor).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reviews_DoctorId");

            entity.HasOne(d => d.Institution).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.InstitutionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reviews_InstitutionId");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reviews_UserId");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email, "UQ__Users__A9D105346202A944").IsUnique();

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.Gender).HasMaxLength(20);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);

            entity.Property(e => e.AddressId).IsRequired(false);

            entity.HasOne(d => d.Address).WithMany(p => p.Users)
                .HasForeignKey(d => d.AddressId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Users_AddressId");
        });

        modelBuilder.Entity<UserSchedule>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.CreatedByUser).WithMany(p => p.UserScheduleCreatedByUsers)
                .HasForeignKey(d => d.CreatedByUserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserSchedules_CreatedBy");

            entity.HasOne(d => d.Institution).WithMany(p => p.UserSchedules)
                .HasForeignKey(d => d.InstitutionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserSchedules_InstitutionId");

            entity.HasOne(d => d.User).WithMany(p => p.UserScheduleUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserSchedules_UserId");
        });
        
        modelBuilder.Entity<SupportIssues>(entity =>
        {
            entity.HasKey(e => e.Id);
          
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.Type).HasConversion(x => (short)x, x => (SupportIssuesEnumType)x).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime2(0)").IsRequired();
            entity.Property(e => e.Active).IsRequired();
            entity.Property(e => e.Status).HasConversion(x => (short)x, x => (StatusSupportEnumType)x).IsRequired();

            entity.HasOne(d => d.User).WithMany(p => p.SupportIssues)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SupportIssues_UserId");
        });

        modelBuilder.Entity<InstitutionRequests>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.InstitutionId).IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnType("datetime2(0)").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime2(0)");
            entity.Property(e => e.Status).HasConversion(x => (short)x, x => (InstitutionRequestsStatusEnumType)x).IsRequired();

            entity.HasOne(d => d.User).WithMany(p => p.InstitutionRequests)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_InstitutionRequests_UserId");
            entity.HasOne(d => d.Institution).WithMany(p => p.InstitutionRequests)
               .HasForeignKey(d => d.InstitutionId)
               .OnDelete(DeleteBehavior.ClientSetNull)
               .HasConstraintName("FK_InstitutionRequests_InstitutionId");
        });
        modelBuilder.Entity<DoctorRequests>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.InstitutionId).IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnType("datetime2(0)").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime2(0)");
            entity.Property(e => e.Status).HasConversion(x => (short)x, x => (DoctorRequestsStatusEnumType)x).IsRequired();

            entity.HasOne(d => d.User).WithMany(p => p.DoctorRequests)
               .HasForeignKey(d => d.UserId)
               .OnDelete(DeleteBehavior.ClientSetNull)
               .HasConstraintName("FK_DoctorRequests_UserId");
            entity.HasOne(d => d.Institution).WithMany(p => p.DoctorRequests)
               .HasForeignKey(d => d.InstitutionId)
               .OnDelete(DeleteBehavior.ClientSetNull)
               .HasConstraintName("FK_DoctorRequests_InstitutionId");
        });
        modelBuilder.Entity<Specialty>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Name)
                  .HasMaxLength(100)
                  .IsRequired();
            entity.Property(e => e.Name).HasMaxLength(100);

        });
        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Name)
                  .HasMaxLength(100)
                  .IsRequired();
            entity.Property(e => e.Name).HasMaxLength(100);

        });
        modelBuilder.Entity<InstitutionService>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.Property(e => e.Description).HasColumnType("nvarchar(max)");
            entity.Property(e => e.Price).HasPrecision(10, 2);
            entity.Property(e => e.Duration).IsRequired();
            entity.Property(e => e.InstitutionId).IsRequired();
          

            entity.HasOne(d => d.Institution).WithMany(p => p.InstitutionServices)
               .HasForeignKey(d => d.InstitutionId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("FK_InstitutionServices_InstitutionId");
            entity.HasOne(d => d.Specialty).WithMany(p => p.InstitutionServices)
               .HasForeignKey(d => d.SpecialtyId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("FK_InstitutionServices_SpecialtyId");
            entity.HasOne(d => d.Service).WithMany(p => p.InstitutionServices)
               .HasForeignKey(d => d.ServiceId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("FK_InstitutionServices_ServiceId");
         
        });

        modelBuilder.Entity<DoctorSpecialty>(entity =>
        {
            entity.HasKey(e => new { e.DoctorId, e.SpecialtyId });

            entity.HasOne(d => d.Doctor).WithMany(p => p.DoctorSpecialties)
               .HasForeignKey(d => d.DoctorId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("FK_DoctorSpecialties_DoctorId");
            entity.HasOne(d => d.Specialty).WithMany(p => p.DoctorSpecialties)
               .HasForeignKey(d => d.SpecialtyId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("FK_DoctorSpecialties_SpecialtyId");

        });
        modelBuilder.Entity<UnregisteredPatient>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.FirstName)
             .IsRequired()
             .HasMaxLength(100);

            entity.Property(e => e.LastName)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(e => e.PhoneNumber)
                  .IsRequired()
                  .HasMaxLength(20);

            entity.Property(e => e.Email)
                  .HasMaxLength(255);

            entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("GETDATE()");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
