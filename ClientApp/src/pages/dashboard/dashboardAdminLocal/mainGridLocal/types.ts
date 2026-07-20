import type AppointmentStatusEnumType from "../../../../enums/AppointmentStatusEnumType";

export type CountsStatCardsResponseDto = {
    appointmentsCount: number;
    doctorsCount: number;
    canceledAppointmentsCount: number;
    appointmentsWithReferralCount: number;
}

export type DetailsRecentAppointmentsResponseDto = {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    patientName: string;
    doctorName: string;
    dateTimeUtc: string;
    price?: number;
    specialty: string;
    type: string;
    duration: number;
    status: AppointmentStatusEnumType;
}