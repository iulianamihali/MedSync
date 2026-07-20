import "./AppointmentDetailsDrawer.scss";
import React, { useEffect, useMemo, useState } from "react";
import {Box, Typography, Avatar, Button, Drawer, IconButton, CircularProgress} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import GlobalSettings from "../../../../../GlobalSettings.json";
import axiosUtil from "../../../../../common/axiosUtil";
import dayjs from "dayjs";
import { Tabs, Tab } from "@mui/material";
import type {GetAppointmentPrescriptions, GetAppointmentReferrals} from "../../../../../components/AppointmentCard";
import ReferralsContent from "../../../../../components/ReferralsContent";
import PrescriptionsContent from "../../../../../components/PrescriptionsContent";

type MedicalRecord = {
    appointmentId: string;
    investigation: string;
    investigationResult: string;
    recommendations: string;
    symptoms: string;
    diagnosis: string;
    appointmentStatus: string;
};

type AppointmentHistoryDetails = {
    medicalRecordId: string | null;
    doctorName: string;
    specialtyName: string;
    serviceName: string;
    dateTime: string;
    address: string;
    dataMedicalRecord: MedicalRecord;
    hasMedicalRefferals: boolean;
    hasMedicalPrescriptions: boolean;
};

type Props = {
    open: boolean;
    onClose: () => void;
    appointmentId: string;
    sharedToken?: string;
};

enum DrawerTab {
    Record = "record",
    Referrals = "referrals",
    Prescriptions = "prescriptions",
}

type AppPrescription = {
    prescriptionId: string;
    diagnosis: string;
    issuedAt: string;
    expirationDate: string;
};

type AppReferral = {
    medicalReferralId: string;
    specialtyName: string;
    issuedAt: string;
    expirationDate: string;
    suspectedDiagnosis: string;
};

type AppointmentFullDetails = {
    appointmentDetails: AppointmentHistoryDetails;
    prescriptions: AppPrescription[];
    refferals: AppReferral[];
};

const SECTIONS: { key: keyof MedicalRecord; label: string }[] = [
    { key: "symptoms", label: "Symptoms" },
    { key: "investigation", label: "Investigation" },
    { key: "investigationResult", label: "Investigation Result" },
    { key: "diagnosis", label: "Diagnosis" },
    { key: "recommendations", label: "Recommendations" },
];

const AppointmentDetailsDrawer: React.FC<Props> = ({ open, onClose, appointmentId, sharedToken }) => {
    const [activeTab, setActiveTab] = useState<DrawerTab>(DrawerTab.Record);
    const [details, setDetails] = useState<AppointmentHistoryDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [appointmentReferrals, setAppointmentReferrals] = useState<GetAppointmentReferrals[]>([]);
    const [appointmentPrescriptions, setAppointmentPrescriptions] = useState<GetAppointmentPrescriptions[]>([]);
    const [appointmentFullDetails, setAppointmentFullDetails] = useState<AppointmentFullDetails | null>(null);

    const activeDetails = useMemo(() => {
        if (sharedToken) return appointmentFullDetails?.appointmentDetails ?? null;
        return details;
    }, [sharedToken, appointmentFullDetails, details]);

    const activeReferrals = useMemo(() => {
        if (sharedToken) return appointmentFullDetails?.refferals ?? [];
        return appointmentReferrals;
    }, [sharedToken, appointmentFullDetails, appointmentReferrals]);

    const activePrescriptions = useMemo(() => {
        if (sharedToken) return appointmentFullDetails?.prescriptions ?? [];
        return appointmentPrescriptions;
    }, [sharedToken, appointmentFullDetails, appointmentPrescriptions]);

    const getAppointmentDetails = (id: string) => {
        setLoading(true);
        const url = `${GlobalSettings.patientRoute}/getAppointmentHistoryDetails/${id}`;
        axiosUtil.get<AppointmentHistoryDetails>(url)
            .then(res => {
                setDetails(res.data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    };

    const getFullAppointmentDetailsShared = (token: string, id: string) => {
        setLoading(true);
        const url = `${GlobalSettings.sharedMedical}/getAppointmentDetails/${token}/${id}`;
        axiosUtil.get<AppointmentFullDetails>(url)
            .then(res => {
                setAppointmentFullDetails(res.data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    };

    const getAppointmentReferrals = (id: string) => {
        const url = `${GlobalSettings.medicalReferrals}/getAppointmentReferrals/${id}`;
        axiosUtil.get<GetAppointmentReferrals[]>(url)
            .then(res => setAppointmentReferrals(res.data))
            .catch(err => console.error(err));
    };

    const getAppointmentPrescriptions = (id: string) => {
        const url = `${GlobalSettings.medicalPrescription}/getAppointmentPrescriptions/${id}`;
        axiosUtil.get<GetAppointmentPrescriptions[]>(url)
            .then(res => setAppointmentPrescriptions(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        if (sharedToken) {
            getFullAppointmentDetailsShared(sharedToken, appointmentId);
        } else {
            if(appointmentId) {
                if (activeTab === DrawerTab.Referrals)
                    getAppointmentReferrals(appointmentId);
                else if (activeTab === DrawerTab.Prescriptions)
                    getAppointmentPrescriptions(appointmentId);
                else
                    getAppointmentDetails(appointmentId);
            }
        }
    }, [activeTab, appointmentId]);

    const handleExportPdf = (medicalRecordId: string) => {
        const url = `${GlobalSettings.medicalRecords}/getMedicalReportPdfData/${medicalRecordId}`;
        axiosUtil.get(url, { responseType: "blob" })
            .then(res => {
                const blob = new Blob([res.data], { type: "application/pdf" });
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = "MedicalReport.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(err => console.error(err));
    };

    const initials = activeDetails?.doctorName
        ?.split(" ")
        .map((n) => n.charAt(0))
        .join("") ?? "";

    const dt = activeDetails?.dateTime ? dayjs(activeDetails.dateTime) : null;

    return (
        <Drawer anchor="right" open={open} onClose={onClose} className="appt-drawer">
            <Box className="appt-drawer__header">
                <Avatar sx={{ bgcolor: "#e6f5f2", color: "#00796b", width: 44, height: 44, fontSize: "0.85rem", fontWeight: 500 }}>
                    {initials}
                </Avatar>
                <Box>
                    <Typography className="appt-drawer__doc-name">Dr. {activeDetails?.doctorName}</Typography>
                    <Typography className="appt-drawer__doc-spec">{activeDetails?.specialtyName}</Typography>
                </Box>
                <IconButton onClick={onClose} className="appt-drawer__close-btn" size="small">
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>

            <Box className="appt-drawer__tabs">
                <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                    <Tab label="Medical Record" value={DrawerTab.Record} />
                    <Tab label="Referrals" value={DrawerTab.Referrals} />
                    <Tab label="Prescriptions" value={DrawerTab.Prescriptions} />
                </Tabs>
            </Box>

            {loading ? (
                <Box className="appt-drawer__loading">
                    <CircularProgress sx={{ color: "#00796b" }} />
                </Box>
            ) : (
                <>
                    {activeTab === DrawerTab.Record && (
                        <>
                            <Box className="appt-drawer__meta">
                                <Box className="appt-drawer__meta-item">
                                    <Typography className="appt-drawer__meta-label">Date</Typography>
                                    <Typography className="appt-drawer__meta-value">{dt?.format("DD.MM.YYYY") ?? "—"}</Typography>
                                </Box>
                                <Box className="appt-drawer__meta-item">
                                    <Typography className="appt-drawer__meta-label">Time</Typography>
                                    <Typography className="appt-drawer__meta-value">{dt?.format("HH:mm") ?? "—"}</Typography>
                                </Box>
                                <Box className="appt-drawer__meta-item">
                                    <Typography className="appt-drawer__meta-label">Location</Typography>
                                    <Typography className="appt-drawer__meta-value">{activeDetails?.address ?? "—"}</Typography>
                                </Box>
                            </Box>

                            <Box className="appt-drawer__body">
                                {SECTIONS.map(({ key, label }) => {
                                    const value = activeDetails?.dataMedicalRecord?.[key];
                                    return (
                                        <Box key={key} className="appt-drawer__section">
                                            <Typography className="appt-drawer__section-title">{label}</Typography>
                                            <Typography className={value ? "appt-drawer__section-text" : "appt-drawer__section-empty"}>
                                                {value || "No data available"}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>

                            <Box className="appt-drawer__footer">
                                {!sharedToken && activeDetails?.medicalRecordId && activeDetails?.dataMedicalRecord &&
                                    (activeDetails.dataMedicalRecord.symptoms ||
                                        activeDetails.dataMedicalRecord.diagnosis ||
                                        activeDetails.dataMedicalRecord.investigation) && (
                                        <Button onClick={() => handleExportPdf(activeDetails.medicalRecordId!)}
                                                className="appt-drawer__export-btn"
                                                startIcon={<FileDownloadOutlinedIcon />}
                                                fullWidth>
                                            Export Medical Report
                                        </Button>
                                    )}
                            </Box>
                        </>
                    )}

                    {activeTab === DrawerTab.Referrals && (
                        <Box className="appt-drawer__body">
                            <ReferralsContent referrals={activeReferrals} />
                        </Box>
                    )}

                    {activeTab === DrawerTab.Prescriptions && (
                        <Box className="appt-drawer__body">
                            <PrescriptionsContent prescriptions={activePrescriptions} />
                        </Box>
                    )}
                </>
            )}
        </Drawer>
    );
};

export default AppointmentDetailsDrawer;