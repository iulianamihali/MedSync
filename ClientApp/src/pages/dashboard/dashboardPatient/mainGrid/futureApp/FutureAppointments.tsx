import "./FutureAppointments.scss";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Chip,
    Button,
    Avatar,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import useAuth from "../../../../../store/features/auth/authHook";
import dayjs from "dayjs";
import GlobalSettings from "../../../../../GlobalSettings.json";
import axiosUtil from "../../../../../common/axiosUtil";
import AppointmentStatusEnumType, { appointmentStatusValues } from "../../../../../enums/AppointmentStatusEnumType";
import { getAvatarColor } from "../../../../../common/avatarColorUtil";
import CircularProgress from "@mui/material/CircularProgress";

export type GetFutureAppointmentsResponseDto = {
    appointmentId: string;
    statusAppointment: AppointmentStatusEnumType;
    specialtyName: string;
    startDateTimeUtc: string;
    endDateTimeUtc: string;
    institutionName: string;
    address: string;
    doctorName: string;
}
type Props = {
    careUnregisteredPatientId?: string;
}

const FutureAppointments = (props: Props) => {
    const patientId = useAuth()?.user?.sub;
    const [futureAppointments, setFutureAppointments] = useState<GetFutureAppointmentsResponseDto[]>([]);
    const [loadingFutureApp, setLoadingFutureApp] = useState<boolean>(false);

    const getFutureAppointments = (patientId: string) => {
        setLoadingFutureApp(true);
        const url = `${GlobalSettings.patientRoute}/getFutureAppointments/${patientId}`;
        axiosUtil.get<GetFutureAppointmentsResponseDto[]>(url)
            .then(res => {
                setFutureAppointments(res.data);
                setLoadingFutureApp(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingFutureApp(false);
            });
    }

    useEffect(() => {
        const id = props.careUnregisteredPatientId || patientId;
        if (id) getFutureAppointments(id);
    }, [patientId, props.careUnregisteredPatientId]);

    const getStatusInfo = (status: AppointmentStatusEnumType) => {
        return appointmentStatusValues.find(s => s.id === status);
    };

    return (
        <Box className="upcoming">
            <Box className="upcoming__header">
                {!props.careUnregisteredPatientId &&
                <Typography className="upcoming__title">
                    Future Appointments
                </Typography>
                }

            </Box>

            {loadingFutureApp ?(<Box sx={{ display: "flex", justifyContent: "center", py: 17 }}>
                    <CircularProgress />
                </Box>)
                :
                futureAppointments.length === 0 ?
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 8,
                        gap: 0.5,
                        opacity: 0.5
                    }}>
                        <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>📅</Typography>
                        <Typography sx={{ fontWeight: 600, color: "text.primary", fontSize: "1rem" }}>
                            No upcoming appointments
                        </Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                            You have no future appointments scheduled.
                        </Typography>
                    </Box>
                    :
            <Box className="upcoming__scroll">
                <Box className="upcoming__grid">
                    {futureAppointments.map((apt, index) => {
                        const isNext = index === 0;
                        const statusInfo = getStatusInfo(apt.statusAppointment);
                        const [firstName, ...lastNameParts] = apt.doctorName.trim().split(/\s+/);
                        const lastName = lastNameParts.join(" ");
                        const avatarColor = getAvatarColor(firstName, lastName || "");
                        const initials = apt.doctorName.split(" ").map(n => n.charAt(0)).join("");

                        return (
                            <Box
                                key={apt.appointmentId}
                                className={`upcoming__card ${isNext ? "upcoming__card--next" : ""}`}
                            >
                                <Box className="upcoming__card-header">
                                    <Chip
                                        label={statusInfo?.text}
                                        size="small"
                                        className={`upcoming__status-chip ${
                                            apt.statusAppointment === AppointmentStatusEnumType.Confirmed
                                                ? "upcoming__status-chip--confirmed"
                                                : "upcoming__status-chip--pending"
                                        }`}
                                    />
                                    {isNext && (
                                        <Typography className="upcoming__next-badge">
                                            Next
                                        </Typography>
                                    )}
                                </Box>

                                <Typography className="upcoming__specialty">
                                    {apt.specialtyName}
                                </Typography>

                                <Box className="upcoming__divider" />

                                <Box className="upcoming__datetime">
                                    <Typography className="upcoming__date">
                                        {dayjs(apt.startDateTimeUtc).format("dddd, D MMMM YYYY")}
                                    </Typography>
                                    <Typography className="upcoming__time">
                                        {dayjs(apt.startDateTimeUtc).format("HH:mm")} - {dayjs(apt.endDateTimeUtc).format("HH:mm")}
                                    </Typography>
                                    <Typography className="upcoming__institution">
                                        {apt.institutionName}
                                    </Typography>
                                </Box>

                                <Box className="upcoming__divider" />

                                <Box className="upcoming__doctor">
                                    <Avatar
                                        sx={{
                                            bgcolor: avatarColor?.bg,
                                            color: avatarColor?.color,
                                            width: 44,
                                            height: 44,
                                            fontSize: "0.85rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {initials}
                                    </Avatar>
                                    <Box className="upcoming__doctor-info">
                                        <Typography className="upcoming__doctor-name">
                                            Dr. {apt.doctorName}
                                        </Typography>
                                        <Typography className="upcoming__doctor-title">
                                            {apt.specialtyName}
                                        </Typography>
                                    </Box>
                                </Box>


                            </Box>
                        );
                    })}
                </Box>
            </Box>
            }
        </Box>
    );
};

export default FutureAppointments;