import type AppointmentStatusEnumType from "../../enums/AppointmentStatusEnumType";
import type {
    AvailableSlotDto,
    Service
} from "../dashboard/dashboardAdminLocal/mainGridLocal/appointmentsView/CreateAppointmentView";
import type {Specialty} from "../signUp/formSignUp/FormSignUp";

export type CalendarAppointmentsDto = {
    id: string;
    status: AppointmentStatusEnumType;
    specialty: string;
    service: string;
    doctorName: string;
    patientName: string;
    startDateTimeUtc: string;
    endDateTimeUtc: string;
    standardPrice: number;
    totalPrice: number;
    duration: number;
}

export type CalendarAppointmentsByDoctorDto = {
    id: string;
    status: AppointmentStatusEnumType;
    service: string;
    patientName: string;
    startDateTimeUtc: string;
    endDateTimeUtc: string;
    duration: number;
}

export type CheckAvailabilityDoctorsResponse = {
    id: string;
    name: string;
    doctorSpecialties: Specialty[];
    rating: number;
    totalReviews: number;
    slotsAvailable: AvailableSlotDto[];
}