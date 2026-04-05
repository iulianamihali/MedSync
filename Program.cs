using System.Text;
using MedSync.DataLayer.Enums;
using MedSync.Models;
using MedSync.Services;
using MedSync.Services.IServices;
using MedSync.Services.pdf;
using MedSync.Workers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
var jwt = builder.Configuration.GetSection("Jwt");
var key = builder.Configuration["Jwt:Key"];
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IGlobalAdminService, GlobalAdminService>();
builder.Services.AddScoped<IInstitutionService, MedSync.Services.InstitutionServices>();
builder.Services.AddScoped<MailerSendService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ILocalAdminService, LocalAdminService>();
builder.Services.AddScoped<IGlobalDataService, GlobalDataService>();
builder.Services.AddScoped<IAppointmentsService, AppointmentsService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IMedicalRecordsService, MedicalRecordsService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<PdfService>();
builder.Services.AddScoped<IMedicalReferralService, MedicalReferralService>();
builder.Services.AddScoped<IMedicalPrescriptionService, MedicalPrescriptionService>();
builder.Services.AddScoped<SharedMedicalService>();
builder.Services.AddHostedService<ReminderWorker>();
builder.Services.AddScoped<ICareGivingService, CareGivingService>();
builder.Services.AddScoped<ISupportIssuesService, SupportIssuesService>();
builder.Services.AddScoped<IGeminiService, GeminiService>();

// Add services to the container.

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<MedSyncContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MedSyncDb"))
);
builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Convert.FromBase64String(key!)),

            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],

            ValidateAudience = true,
            ValidAudience = jwt["Audience"],

            ValidateLifetime = true,
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowFrontend",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:5173", "https://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});

QuestPDF.Settings.License = LicenseType.Community;

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var cfg = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var adminEmail = cfg["Admin:Email"];

    var db = scope.ServiceProvider.GetRequiredService<MedSyncContext>();

    var exists = await db.Users.AsNoTracking().AnyAsync(u => u.Email == adminEmail);
    if (!exists)
    {
        var adminPass = cfg["Admin:Password"];
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = adminEmail!,
            Role = UserType.GlobalAdmin,
            IsActive = true,
        };
        var hasher = new PasswordHasher<User>();
        user.PasswordHash = hasher.HashPassword(user, adminPass!);

        db.Users.Add(user);
        await db.SaveChangesAsync();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
