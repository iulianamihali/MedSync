import type AppointmentStatusEnumType from "../../../../enums/AppointmentStatusEnumType";

export type DetailsUpcomingAppointmentsResponseDto = {
    appointmentId: string;
    patientId: string;
    patientName: string;
    dateTimeUtc: string;
    type: string;
    status: AppointmentStatusEnumType;
}

export type CountsStatCardsResponseDto = {
    totalPatientsWithAppointments: number;
    totalAppointmentsByPeriod: number;
    totalReferralsByAppointment: number;
    totalPrescriptionsByAppointment: number;
}

export type DoctorFeedbackResponseDto = {
    averageRating: number;
    totalReviews: number;
    reviews: DoctorReviewItemDto[];
}

export type DoctorReviewItemDto = {
    reviewId: string;
    patientFirstName: string;
    patientLastName: string
    rating: number;
    comment: string;
    createdAt: string;
}