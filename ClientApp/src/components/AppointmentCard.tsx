import { Box, Typography, Paper, Chip, Button } from "@mui/material";
import AppointmentStatusEnumType, {appointmentStatusValues} from "../enums/AppointmentStatusEnumType";
import {useEffect, useState} from "react";
import PatientMedicalRecordView, {
    type MedicalRecord
} from "../pages/dashboard/dashboardDoctor/mainGridDoctor/patientMedicalRecordView/PatientMedicalRecordView";
import CustomPopUp from "./CustomPopUp";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import GlobalSettings from "../GlobalSettings.json";
import axiosUtil from "../common/axiosUtil";
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ReferralsContent from "./ReferralsContent";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import PrescriptionsContent from "./PrescriptionsContent";

type Props = {
    medicalRecordId: string,
    appointmentId: string;
    date: string;
    status: AppointmentStatusEnumType;
    service: string;
    diagnosis: string;
    updateStatusCallback: (appointmentId: string, status: AppointmentStatusEnumType) => void;
};

export type GetAppointmentReferrals = {
    medicalReferralId: string;
    specialtyName: string;
    issuedAt: string;
    expirationDate: string;
    suspectedDiagnosis: string;
}

export type GetAppointmentPrescriptions = {
    prescriptionId: string;
    diagnosis: string;
    issuedAt: string;
    expirationDate: string;
}

const statusColors = {
    Canceled: { bg: "#F5F5F5", color: "#616161" },
    Missed: { bg: "#FFEBEE", color: "#C62828" },
    Confirmed: { bg: "#E3F2FD", color: "#1976D2" },
    InProgress: { bg: "#FFF3E0", color: "#EF6C00" },
    Rescheduled: { bg: "#FFF3E0", color: "#E65100" },
    Completed: { bg: "#E8F5E9", color: "#2E7D32" },
};

const AppointmentCard = (props: Props) => {
    const [openEdit, setOpenEdit] = useState<boolean>(false);
    const [openReferrals, setOpenReferrals] = useState<boolean>(false);
    const [appointmentReferrals, setAppointmentReferrals] = useState<GetAppointmentReferrals[]>([]);
    const [openPrescriptions, setOpenPrescriptions] = useState<boolean>(false);
    const [appointmentPrescriptions, setAppointmentPrescriptions] = useState<GetAppointmentPrescriptions[]>([]);

    const handleExportPdf = (medicalRecordId: string) => {
        const url = `${GlobalSettings.medicalRecords}/getMedicalReportPdfData/${medicalRecordId}`;
        axiosUtil.get(url, {
            responseType: "blob",
        })
            .then (res => {
                const blob = new Blob([res.data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = "MedicalReport.pdf";
                document.body.appendChild(a);
                a.click();

                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(err => {
                console.error(err);
            })
    }

    const getAppointmentReferrals = (appointmentId: string) => {
        const url = `${GlobalSettings.medicalReferrals}/getAppointmentReferrals/${appointmentId}`;
        axiosUtil.get<GetAppointmentReferrals[]>(url)
            .then (res => {
                setAppointmentReferrals(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }

    const getAppointmentPrescriptions = (appointmentId: string) => {
        const url = `${GlobalSettings.medicalPrescription}/getAppointmentPrescriptions/${appointmentId}`;
        axiosUtil.get<GetAppointmentPrescriptions[]>(url)
            .then (res => {
                setAppointmentPrescriptions(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }

    useEffect(() => {
        if(openReferrals)
            getAppointmentReferrals(props?.appointmentId);
    }, [openReferrals]);

    useEffect(() => {
        if(openPrescriptions)
            getAppointmentPrescriptions(props?.appointmentId);
    }, [openPrescriptions]);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                border: "1px solid #E5E7EB",
                borderRadius: 5,
                transition: "0.2s ease",
                borderLeft: `8px solid ${statusColors[AppointmentStatusEnumType[props.status]].bg}`,
                "&:hover": {
                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography
                    sx={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#6B7280",
                    }}
                >
                    {props.date}
                </Typography>

                <div className="col-status">
                    <Chip
                        label={appointmentStatusValues.find(x => x.id === props.status)?.text}
                        sx={{
                            fontWeight: 600,
                            borderRadius: 2,
                            minWidth: "100px",
                            justifyContent: "center",
                            bgcolor: statusColors[AppointmentStatusEnumType[props.status]].bg,
                            color: statusColors[AppointmentStatusEnumType[props.status]].color,
                        }}
                    />
                </div>
            </Box>

            <Typography
                sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    mb: 0.25,
                }}
            >
                Service
            </Typography>

            <Typography
                sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111827",
                    mb: 1,
                }}
            >
                {props.service}
            </Typography>

            <Typography
                sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    mb: 0.25,
                }}
            >
                Diagnosis
            </Typography>
            <Typography
                sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: props.diagnosis ? "#111827" : "#9CA3AF",
                    fontStyle: props.diagnosis ? "normal" : "italic",
                    mb: 1,
                }}
            >
                {props.diagnosis || "Not completed yet"}
            </Typography>


            <Box sx={{ display: "flex", gap: 2,  flexWrap: "wrap", }}>
                <Button onClick={() => {setOpenEdit(true)}}
                        size="small"
                        variant="outlined"

                >
                    View
                </Button>

                <Button
                    size="small"
                    variant="contained"
                    startIcon={<DownloadOutlinedIcon />}
                    onClick={() => handleExportPdf(props.medicalRecordId)}
                    sx={{
                        backgroundColor: '#E3F2FD',
                        color: '#1565C0',
                        border: '1px solid #BBDEFB',
                        '&:hover': {
                            backgroundColor: '#D6EAF8'
                        }
                    }}
                >
                    Export Medical Record
                </Button>

                <Button
                    size="small"
                    variant="outlined"
                    sx={{
                        backgroundColor: '#E0F2F1',
                        color: '#00695C',
                        border: '1px solid #B2DFDB',
                        '&:hover': {
                            backgroundColor: '#D0ECE7'
                        }
                    }}
                    startIcon={<AssignmentOutlinedIcon />}
                    onClick={() => setOpenReferrals(true)}
                >
                    {"Referrals"}
                </Button>

                <Button
                    size="small"
                    variant="outlined"
                    sx={{
                        backgroundColor: '#F3E5F5',
                        color: '#7B1FA2',
                        border: '1px solid #CE93D8',
                        '&:hover': {
                            backgroundColor: '#E1BEE7'
                        }
                    }}
                    startIcon={<MedicalInformationIcon />}
                    onClick={() => setOpenPrescriptions(true)}
                >
                    {"Prescriptions"}
                </Button>

            </Box>
            <CustomPopUp
                open={openEdit}
                setOpen={setOpenEdit}
                title={"Edit Medical Information"}
                contentComponent={PatientMedicalRecordView}
                dataComponent={{
                    // editStatusAppointmentEntity: infoPopup,
                    // setEditStatusAppointmentEntity: setInfoPopup
                    appointmentId: props.appointmentId,
                    updateStatusCallback: props.updateStatusCallback,
                }}
                showActions={false}
                // textButton={"Save"}
                // onClickCallback={updateStatusAppointment}
                width="100vw"
            />

            <CustomPopUp
                open={openReferrals}
                setOpen={setOpenReferrals}
                title={"Referrals"}
                contentComponent={ReferralsContent}
                dataComponent={{
                    referrals: appointmentReferrals,
                }}
                showActions={true}
                textButton={"Close"}
                // onClickCallback={updateStatusAppointment}
                width="850px"
            />
            <CustomPopUp
                open={openPrescriptions}
                setOpen={setOpenPrescriptions}
                title={"Prescriptions"}
                contentComponent={PrescriptionsContent}
                dataComponent={{
                    prescriptions: appointmentPrescriptions,
                }}
                showActions={true}
                textButton={"Close"}
                // onClickCallback={updateStatusAppointment}
                width="850px"
            />
        </Paper>
    );
};

export default AppointmentCard;
