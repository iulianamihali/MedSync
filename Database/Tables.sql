-- 1. Addresses
CREATE TABLE Addresses (
    Id uniqueidentifier NOT NULL,
    Country nvarchar(100) NOT NULL,
    City nvarchar(100) NOT NULL,
    Street nvarchar(100) NOT NULL,
    Number nvarchar(20) NOT NULL,
    PostalCode nvarchar(20) NOT NULL,
    CONSTRAINT PK_Addresses PRIMARY KEY (Id)
);
GO


-- 2. Users
CREATE TABLE Users (
    Id uniqueidentifier NOT NULL,
    Role int NOT NULL,
    FirstName nvarchar(100) NOT NULL,
    LastName nvarchar(100) NOT NULL,
    Gender nvarchar(20) NOT NULL,
    DateOfBirth date NOT NULL,
    PhoneNumber nvarchar(20) NOT NULL,
    Email nvarchar(255) NOT NULL UNIQUE,
    PasswordHash nvarchar(255) NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    IsActive bit NOT NULL DEFAULT 1,
    AddressId uniqueidentifier NOT NULL,
    CONSTRAINT PK_Users PRIMARY KEY (Id),
    CONSTRAINT FK_Users_AddressId FOREIGN KEY (AddressId) REFERENCES Addresses(Id)
);
GO


-- 3. Institutions
CREATE TABLE Institutions (
    Id uniqueidentifier NOT NULL,
    Code nvarchar(25) not null UNIQUE,
    Name nvarchar(255) NOT NULL,
    PhoneNumber nvarchar(20),
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    AddressId uniqueidentifier NOT NULL,
    Active bit NOT NULL DEFAULT 0,
    TaxIdentificationNumber nvarchar(25) NOT NULL UNIQUE,
    CONSTRAINT PK_Institutions PRIMARY KEY (Id),
    CONSTRAINT FK_Institutions_AddressId FOREIGN KEY (AddressId) REFERENCES Addresses(Id)
);
GO

-- 4. InstitutionUsers
CREATE TABLE InstitutionUsers (
    InstitutionId uniqueidentifier NOT NULL,
    UserId uniqueidentifier NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_InstitutionUsers PRIMARY KEY (InstitutionId, UserId),
    CONSTRAINT FK_InstitutionUsers_InstitutionId FOREIGN KEY (InstitutionId) REFERENCES Institutions(Id),
    CONSTRAINT FK_InstitutionUsers_UserId FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

-- 5. Patients
CREATE TABLE Patients (
    UserId uniqueidentifier NOT NULL,
    CNP nvarchar(13) NOT NULL UNIQUE,
    InsuranceCardNumber nvarchar(50),
    EmergencyContactName nvarchar(100),
    EmergencyContactPhone nvarchar(20),
    CONSTRAINT PK_Patients PRIMARY KEY (UserId),
    CONSTRAINT FK_Patients_UserId FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

-- 6. Doctors
CREATE TABLE Doctors (
    UserId uniqueidentifier NOT NULL,
    YearsOfExperience int NOT NULL,
    MedicalLicenseNumber nvarchar(50) NOT NULL UNIQUE,
    UniversityName nvarchar(255),
    CONSTRAINT PK_Doctors PRIMARY KEY (UserId),
    CONSTRAINT FK_Doctors_UserId FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

-- 7. UserSchedules
CREATE TABLE UserSchedules (
    Id uniqueidentifier NOT NULL,
    DayOfWeek int NOT NULL,
    StartTime time NOT NULL,
    EndTime time NOT NULL,
    UserId uniqueidentifier NOT NULL,
    InstitutionId uniqueidentifier NOT NULL,
    CreatedByUserId uniqueidentifier NOT NULL,
    CONSTRAINT PK_UserSchedules PRIMARY KEY (Id),
    CONSTRAINT FK_UserSchedules_UserId FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_UserSchedules_InstitutionId FOREIGN KEY (InstitutionId) REFERENCES Institutions(Id),
    CONSTRAINT FK_UserSchedules_CreatedBy FOREIGN KEY (CreatedByUserId) REFERENCES Users(Id)
);
GO


-- 8. Reviews
CREATE TABLE Reviews (
    Id uniqueidentifier NOT NULL,
    Rating int NOT NULL,
    Comment nvarchar(1000),
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    UserId uniqueidentifier NOT NULL,
    DoctorUserId uniqueidentifier NOT NULL,
    InstitutionId uniqueidentifier NOT NULL,
    CONSTRAINT PK_Reviews PRIMARY KEY (Id),
    CONSTRAINT FK_Reviews_UserId FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_Reviews_DoctorUserId FOREIGN KEY (DoctorUserId) REFERENCES Doctors(UserId),
    CONSTRAINT FK_Reviews_InstitutionId FOREIGN KEY (InstitutionId) REFERENCES Institutions(Id)
);
GO

-- 9. AssociatedUsers
CREATE TABLE AssociatedUsers (
    PrimaryUserId uniqueidentifier NOT NULL,
    AssociatedUserId uniqueidentifier NOT NULL,
    Relationship nvarchar(100),
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_AssociatedUsers PRIMARY KEY (PrimaryUserId, AssociatedUserId),
    CONSTRAINT FK_AssociatedUsers_Primary FOREIGN KEY (PrimaryUserId) REFERENCES Users(Id),
    CONSTRAINT FK_AssociatedUsers_Associated FOREIGN KEY (AssociatedUserId) REFERENCES Patients(UserId)
);
GO

-- 10. Appointments
CREATE TABLE Appointments (
    Id uniqueidentifier NOT NULL,
    InstitutionId uniqueidentifier NOT NULL,
    InstitutionServiceId uniqueidentifier NOT NULL,
    PatientUserId uniqueidentifier NULL,
    UnregisteredPatientId uniqueidentifier NULL,
    DoctorUserId uniqueidentifier NOT NULL,
    ReferralCode nvarchar(50),
    Type int NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    StartDateTime datetime2 NOT NULL,
    EndDateTime datetime2 NOT NULL,
    Status int NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt datetime2,
    CanceledAt datetime2,
    CONSTRAINT PK_Appointments PRIMARY KEY (Id),
    CONSTRAINT FK_Appointments_InstitutionId FOREIGN KEY (InstitutionId) REFERENCES Institutions(Id),
    CONSTRAINT FK_Appointments_PatientUserId FOREIGN KEY (PatientUserId) REFERENCES Patients(UserId),
    CONSTRAINT FK_Appointments_UnregisteredPatientId FOREIGN KEY (UnregisteredPatientId) REFERENCES UnregisteredPatients(Id),
    CONSTRAINT FK_Appointments_DoctorUserId FOREIGN KEY (DoctorUserId) REFERENCES Doctors(UserId),
    CONSTRAINT FK_Appointments_InstitutionServiceId FOREIGN KEY (InstitutionServiceId) REFERENCES InstitutionService(Id),


);
GO


CREATE UNIQUE INDEX IX_Appointments_Doctor_StartDateTime ON Appointments (DoctorUserId, StartDateTime);
GO

-- 11. PatientAccess
CREATE TABLE PatientAccess (
    OwnerPatientId uniqueidentifier NOT NULL,
    ViewerId uniqueidentifier NOT NULL,
    Scope nvarchar(50) NOT NULL DEFAULT 'all',
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    ExpiresAt datetime2,
    RevokedAt datetime2,
    CONSTRAINT PK_PatientAccess PRIMARY KEY (OwnerPatientId, ViewerId),
    CONSTRAINT FK_PatientAccess_Owner FOREIGN KEY (OwnerPatientId) REFERENCES Patients(UserId),
    CONSTRAINT FK_PatientAccess_Viewer FOREIGN KEY (ViewerId) REFERENCES Users(Id)
);
GO


-- 12. MedicalRecords
CREATE TABLE MedicalRecords (
    Id uniqueidentifier NOT NULL,
	AppointmentId uniqueidentifier NOT NULL,
	Investigation nvarchar(max) NULL,
	InvestigationResult nvarchar(max) NULL,
	Symptoms nvarchar(max) NULL,
	Diagnosis nvarchar(max) NULL,
	Recommendations nvarchar(max) NULL,
    CreatedAt datetime2 NOT NULL,
    UpdatedAt datetime2,
    CONSTRAINT PK_MedicalRecords PRIMARY KEY (Id),
	CONSTRAINT FK_MedicalRecords_AppointmentId FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
);


CREATE TABLE SupportIssues (
	Id uniqueidentifier NOT NULL,
	UserId uniqueidentifier NOT NULL,
	Type smallint NOT NULL,
	Description nvarchar(255) NOT NULL,
	CreatedAt datetime2 NOT NULL,
	Active bit NOT NULL,
	Status smallint NOT NULL,
	CONSTRAINT PK_SupportIssues PRIMARY KEY (Id),
	CONSTRAINT FK_SupportIssues_UserId FOREIGN KEY (UserId) REFERENCES Users(Id),
);

Create table InstitutionRequests (
	Id uniqueidentifier NOT NULL,
	UserId uniqueidentifier NOT NULL,
	InstitutionId uniqueidentifier NOT NULL,
	CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
	UpdatedAt datetime2 NULL,
	Status smallint NOT NULL,
    CONSTRAINT PK_InstitutionRequests PRIMARY KEY (Id),
	CONSTRAINT FK_InstitutionRequests_UserId FOREIGN KEY (UserId) REFERENCES Users(Id),
	CONSTRAINT FK_InstitutionRequests_InstitutionId FOREIGN KEY (InstitutionId) REFERENCES Institutions(Id),

);

Create table DoctorRequests (
    Id uniqueidentifier NOT NULL,
    UserId uniqueidentifier NOT NULL,
    InstitutionId uniqueidentifier NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
	UpdatedAt datetime2 NULL,
	Status smallint NOT NULL,
    CONSTRAINT PK_DoctorRequests PRIMARY KEY (Id),
    CONSTRAINT FK_DoctorRequests_UserId FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_DoctorRequests_InstitutionId FOREIGN KEY (InstitutionId) REFERENCES Institutions(Id),

);

Create Table Specialties(
	Id uniqueidentifier NOT NULL,
    [Name] nvarchar(100) NOT NULL,
	CONSTRAINT PK_Specialties PRIMARY KEY (Id)
);

Create Table Services(
	Id uniqueidentifier NOT NULL,
	[Name] nvarchar(100) NOT NULL,
	CONSTRAINT PK_Services PRIMARY KEY (Id)
);

Create Table InstitutionServices(
	Id uniqueidentifier NOT NULL,
    [Description] nvarchar(max),
	Price decimal(10,2) NOT NULL,
	Duration int NOT NULL,
	InstitutionId uniqueidentifier NOT NULL,
	SpecialtyId uniqueidentifier NOT NULL,
	ServiceId uniqueidentifier NOT NULL,
    IsActive bit NOT NULL DEFAULT 1,
	CONSTRAINT PK_InstitutionServices PRIMARY KEY (Id),
	CONSTRAINT FK_InstitutionServices_InstitutionId FOREIGN KEY (InstitutionId) REFERENCES Institutions(Id),
	CONSTRAINT FK_InstitutionServices_SpecialtyId FOREIGN KEY (SpecialtyId) REFERENCES Specialties(Id),
	CONSTRAINT FK_InstitutionServices_ServiceId FOREIGN KEY (ServiceId) REFERENCES Services(Id),

);

CREATE TABLE DoctorSpecialties (
	Id uniqueIdentifier NOT NULL,
	DoctorUserId uniqueidentifier NOT NULL,
	InstitutionServiceId uniqueidentifier NOT NULL,
	CONSTRAINT PK_DoctorSpecialties PRIMARY KEY (Id),
	CONSTRAINT FK_DoctorSpecialties_DoctorUserId FOREIGN KEY (DoctorUserId) REFERENCES Doctors(UserId),
	CONSTRAINT FK_DoctorSpecialties_InstitutionServiceId FOREIGN KEY (InstitutionServiceId) REFERENCES InstitutionServices(Id),

);

CREATE TABLE UnregisteredPatients (
	Id uniqueidentifier NOT NULL,
	FirstName nvarchar(100) NOT NULL,
	LastName nvarchar(100) NOT NULL,
	Email nvarchar(255) NULL,
	PhoneNumber nvarchar(20) NOT NULL,
	CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),

	CONSTRAINT PK_UnregisteredPatients PRIMARY KEY (Id)
);

CREATE TABLE MedicalReferrals (
	 Id uniqueidentifier NOT NULL,
	 SpecialtyId uniqueidentifier NOT NULL,
	 AppointmentId uniqueidentifier NOT NULL,
	 ReasonReferral nvarchar(max) NOT NULL,
	 SuspectedDiagnosis nvarchar(max) NOT NULL,
	 RelevantClinicalInformation nvarchar(max) NOT NULL,
	 CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
	 ExpirationDate datetime2 NULL, 
	 CONSTRAINT PK_MedicalReferrals PRIMARY KEY (Id),
	 CONSTRAINT FK_MedicalReferrals_SpecialtyId FOREIGN KEY (SpecialtyId) REFERENCES Specialties(Id),
	 CONSTRAINT FK_MedicalReferrals_AppointmentId FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id),
)
