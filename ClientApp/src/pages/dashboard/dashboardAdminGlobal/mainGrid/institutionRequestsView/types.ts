export type InstitutionReqPopUpResponseDto = {
    id: string;
    name: string;
    taxIdentificationNumber: string;
    phoneNumber: string;
    email: string;
    country: string;
    city: string;
    streetAddress: string;
    streetNumber: string;
    createdAt: string;

    //this property is not sended by backend
    actionType: 'approve' | 'reject' | null;
}
