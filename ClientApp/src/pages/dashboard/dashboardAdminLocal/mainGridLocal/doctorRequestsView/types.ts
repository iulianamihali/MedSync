export type DoctorReqPopUpResponseDto = {
    id: string;
    name: string;
    email: string;
    dateOfBirth: string;
    phoneNumber: string;
    universityName: string;
    specialization: string;
    medicalLicenseNumber: string;
    yearsOfExperience: string;
    createdAt: string;

    //this property is not sended by backend
    actionType: 'approve' | 'reject' | null;
}
