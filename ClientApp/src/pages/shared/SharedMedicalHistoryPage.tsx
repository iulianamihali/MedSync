import React, {useEffect, useMemo, useState} from "react";
import { Box, Typography, Chip, Avatar, TextField, InputAdornment } from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import dayjs from "dayjs";
import axiosUtil from "../../common/axiosUtil";
import GlobalSettings from "../../GlobalSettings.json";
import type {AppointmentHistoryDto} from "../patients/components/appHistory/AppointmentHistory";
import {useParams} from "react-router-dom";
import { getAvatarColor } from "../../common/avatarColorUtil";
import AppointmentDetailsDrawer from "../patients/components/appHistory/appDetailsDrawer/AppointmentDetailsDrawer";
import "../patients/components/appHistory/AppointmentHistory.scss";

type PatientBasicInfo = {
    id: string;
    fullName: string;
    dateOfBirth: string;
};

type SharedMedicalHistoryResponse = {
    basicInfo: PatientBasicInfo;
    appointments: AppointmentHistoryDto[];
};

const SharedMedicalHistoryPage: React.FC = () => {
    const [patientInfo, setPatientInfo] = useState<PatientBasicInfo | null>(null);
    const [appointmentsHistory, setAppointmentHistory] = useState<AppointmentHistoryDto[]>([]);
    const [searched, setSearched] = useState<string>('');
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const [selectedAppId, setSelectedAppId] = useState<string>("");
    const { token } = useParams<{ token: string }>();
    const [expired, setExpired] = useState<boolean>(false);

    const filteredApp = useMemo(() => {
        if (searched === "") return appointmentsHistory;
        return appointmentsHistory.filter(x =>
            x.specialty.toLowerCase().includes(searched.toLowerCase()) ||
            x.doctorName.toLowerCase().includes(searched.toLowerCase())
        );
    }, [searched, appointmentsHistory]);

    useEffect(() => {
        if (token) {
            const url = `${GlobalSettings.sharedMedical}/getSharedMedicalHistory/${token}`;
            axiosUtil.get<SharedMedicalHistoryResponse>(url)
                .then(res => {
                    setPatientInfo(res.data.basicInfo);
                    setAppointmentHistory(res.data.appointments);
                })
                .catch(err => {
                    setExpired(true);
                    console.error(err);
                });
        }
    }, [token]);

    if (expired) {
        return (
            <Box sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 3
            }}>
                <Box sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "#fff3e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2
                }}>
                    <Typography sx={{ fontSize: 32 }}>🔒</Typography>
                </Box>
                <Typography sx={{ fontSize: 22, fontWeight: 600, color: "#1a2e35", mb: 1 }}>
                    Link Expired or Invalid
                </Typography>
                <Typography sx={{ fontSize: "0.9rem", color: "#5f6368", maxWidth: 400 }}>
                    This shared medical history link is no longer active. It may have expired or been revoked by the patient. Please request a new link.
                </Typography>
            </Box>
        );
    }
    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: { sm: "100%", md: "1700px" },
                padding: { xs: 2, md: 3 },
                overflow: "hidden",
                height: "97vh",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
            }}
        >
            {patientInfo && (
                <Box sx={{ flexShrink: 0, mb: 1 }}>
                    <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 500, fontSize: 24 }}>
                        Shared Medical History
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", mt: 0.5 }}>
                        {patientInfo.fullName} · Born {dayjs(patientInfo.dateOfBirth).format("D MMM YYYY")}
                    </Typography>
                </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, flexShrink: 0 }}>
                <TextField
                    value={searched}
                    onChange={(e) => setSearched(e.target.value)}
                    sx={{ width: { xs: "100%", sm: 290 }, marginRight: { xs: 0, sm: "40px" } }}
                    placeholder="Search by specialty or doctor"
                    variant="standard"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Box>

            <Box sx={{ flex: 1, px: { xs: 1, md: 2 } }}>
                <Grid
                    container
                    spacing={2}
                    sx={{
                        overflowY: "auto",
                        overflowX: "hidden",
                        maxHeight: "75vh",
                        alignContent: "flex-start",
                        marginLeft: "-13px"
                    }}
                >
                    {filteredApp.map((appt) => {
                        const initials = appt.doctorName.split(" ").map((n) => n.charAt(0)).join("");
                        const [firstName, ...lastNameParts] = appt.doctorName.trim().split(/\s+/);
                        const lastName = lastNameParts.join(" ");
                        const avatarColor = getAvatarColor(firstName, lastName || "");
                        const dt = dayjs(appt.startDateTime);

                        return (
                            <Grid key={appt.appointmentId} size={{ xs: 12, sm: 6, md: 3 }}>
                                <Box className="past-appts__card">
                                    <Box className="past-appts__card-top">
                                        <Box className="past-appts__card-top-row">
                                            <Typography className="past-appts__datetime">
                                                {dt.format("ddd, D MMM YYYY")} · {dt.format("HH:mm")}
                                            </Typography>
                                            <Chip label="Completed" size="small" className="past-appts__status-tag past-appts__status-tag--completed" />
                                        </Box>
                                        <Typography className="past-appts__specialty">{appt.specialty}</Typography>
                                        <Typography className="past-appts__clinic">
                                            {appt.institutionName}
                                        </Typography>
                                        <Typography className="past-appts__address">{appt.address}</Typography>
                                    </Box>
                                    <Box className="past-appts__card-bottom">
                                        <Avatar sx={{ bgcolor: avatarColor?.bg, color: avatarColor?.color, width: 32, height: 32, fontSize: "0.7rem", fontWeight: 500 }}>
                                            {initials}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography className="past-appts__doctor-name">Dr. {appt.doctorName}</Typography>
                                        </Box>
                                        <Box onClick={() => { setOpenDetails(true); setSelectedAppId(appt.appointmentId); }} className="past-appts__arrow">
                                            <ChevronRightIcon sx={{ fontSize: 14, color: "#2d655f" }} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            <AppointmentDetailsDrawer
                open={openDetails}
                onClose={() => setOpenDetails(false)}
                appointmentId={selectedAppId}
                sharedToken={token}
            />
        </Box>
    );
};

export default SharedMedicalHistoryPage;