import type UserEnumType from "../../enums/UserEnumType.ts";

export interface SignupRequestDto {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth?: string;
    phoneNumber: string;
    email: string;
    password: string;
    role: UserEnumType;
    patientData?: PatientDataDto;
    doctorData?: DoctorDataDto;
}

export interface PatientDataDto {
    cnp: string;
    insuranceNumber?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
}

export interface DoctorDataDto {
    institutionCode: string;
    yearsOfExperience: number;
    licenseNumber: string;
    universityName?: string;
}