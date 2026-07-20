export type DataTableInstitutionsDto = {
    id: string;
    institutionName: string;
    adminName: string;
    address: string;
    country: string;
    city: string;
    streetAddress: string;
    streetNumber: string;
    postalCode: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
    status: boolean;
}

export type InstitutionDetailsResponse = {
    institutionId: string;
    institutionName: string;
    rating: number;
    totalReviews: number;
    address: string;
    doctors: DoctorCardItem[];
    latitude?: number;
    longitude?: number;
    distance?: number;
}
export type DoctorCardItem = {
    doctorId: string;
    name: string;
    rating: number;
    specialties: string[];
}