import UserEnumType from "../enums/UserEnumType";

export default class SignUpEntity {
    firstName: string = "";
    lastName: string = "";
    gender: string = "";
    dateOfBirth: string = "";
    phoneNumber: string = "";
    email: string = "";
    password: string = "";
    role: UserEnumType = UserEnumType.Patient;

    cnp: string = "";
    insuranceCardNumber: string = "";
    emergencyContactName: string = "";
    emergencyContactPhone: string = "";

    institutionCode: string = "";
    specialties: string[] = [];
    yearsOfExperience: number | null = null;
    medicalLicenseNumber: string = "";
    universityName: string = "";
}
