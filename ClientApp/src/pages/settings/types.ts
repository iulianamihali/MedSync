export type SettingsDataUserDto = {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    country: string;
    city: string;
    streetAddress: string;
    streetNumber: string;
    postalCode: string;
    institutionName: string;
    cui: string;
}

export type SettingsDataDoctorDto = {
    id: string;
    specialties: string;
    yearsOfExperience: number;
    medicalLicenseNumber: string;
    universityName: string;
}

export type DoctorWorkingHoursDayDto = {
    day: string;
    enabled: boolean;
    start: string;
    end: string;
}

export type SaveDoctorWorkingHoursRequestDto = {
    institutionId: string;
    doctorId: string;
    workingHours: DoctorWorkingHoursDayDto[];
}

