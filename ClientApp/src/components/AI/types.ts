import type {InstitutionDetailsResponse} from "../../pages/institutions/types";
import type {CalendarAppointmentsByDoctorDto} from "../../pages/appointments/types";

export enum MessageRole {
    User = 'user',
    MedicalAssistant = 'medicalAssistant',
}

export type AIMessage = {
    role: MessageRole;
    text?: string;
    clinics?: InstitutionDetailsResponse[];
}

export type AskResponseDto = {
    message?: string,
    clinics: InstitutionDetailsResponse[],
}
export type UserCoordinates = {
    latitude: number,
    longitude: number,
}

export type DoctorPatientSummaryDto = {
    patientId: string;
    patientName: string;
    isRegistered: boolean;
    visits: number;
    lastVisitUtc?: string;
    symptoms: string[];
    diagnoses: string[];
    medications: string[];
    referrals: string[];
    recommendations: string[];
};

export type AvailableSlotsDto = {
    start: string;
    end: string;
}
export type DoctorAIMessage = {
    role: 'user' | 'model';
    text?: string;
    appointments?: CalendarAppointmentsByDoctorDto[];
    patients?: DoctorPatientSummaryDto[];
    availableSlots?: AvailableSlotsDto[];
};

export type DoctorAskResponseDto = {
    message?: string;
    upcomingAppointments?: CalendarAppointmentsByDoctorDto[];
    patients?: DoctorPatientSummaryDto[];
    availableSlots?: AvailableSlotsDto[];
};