import type AppointmentStatusEnumType from "../enums/AppointmentStatusEnumType";

export type EditStatusAppointmentEntity = {
    id: string;
    patientName: string;
    doctorName: string;
    dateTimeUtc: string;
    price?: number;
    status: AppointmentStatusEnumType;
}