import "./ActiveMedications.scss";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {Box, Typography, Button, Avatar, Tooltip} from "@mui/material";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import GlobalSettings from "../../../../../GlobalSettings.json";
import axiosUtil from "../../../../../common/axiosUtil";
import useAuth from "../../../../../store/features/auth/authHook";
import dayjs from "dayjs";
import { getAvatarColor } from "../../../../../common/avatarColorUtil";
import type { Medication } from "../../../../patients/components/PrescriptionModal";

type ActiveMedicationsDto = {
    prescriptionId: string;
    doctorName: string;
    diagnosis: string;
    prescribedAt: string;
    medicationItems: Medication[];
}

const MedScroll: React.FC<{
    medications: Medication[];
    prescribedAt: string;
    getDaysRemaining: (prescribedAt: string, duration: string | null) => number;
}> = (props) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const totalMeds = props.medications.length;

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el || totalMeds <= 1) return;

        const items = el.querySelectorAll(".active-meds__med-item");
        if (!items.length) return;

        const containerTop = el.scrollTop;
        const containerHeight = el.clientHeight;
        const containerCenter = containerTop + containerHeight / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        items.forEach((item, i) => {
            const htmlItem = item as HTMLElement;
            const itemCenter = htmlItem.offsetTop + htmlItem.offsetHeight / 2;
            const distance = Math.abs(itemCenter - containerCenter);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        });

        setActiveIndex(closestIndex);
    }, [totalMeds]);

    const scrollToIndex = (index: number) => {
        const el = scrollRef.current;
        if (!el) return;
        const items = el.querySelectorAll(".active-meds__med-item");
        if (items[index]) {
            (items[index] as HTMLElement).scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    };

    const showIndicators = totalMeds > 1;

    return (
        <Box className="active-meds__meds-section">
            {showIndicators && (
                <Box className="active-meds__scroll-nav">
                    <Box
                        className={`active-meds__scroll-arrow ${activeIndex === 0 ? "active-meds__scroll-arrow--disabled" : ""}`}
                        onClick={() => activeIndex > 0 && scrollToIndex(activeIndex - 1)}
                    >
                        <KeyboardArrowUpRoundedIcon />
                    </Box>
                    <Typography className="active-meds__scroll-counter">
                        {activeIndex + 1}/{totalMeds}
                    </Typography>
                    <Box
                        className={`active-meds__scroll-arrow ${activeIndex === totalMeds - 1 ? "active-meds__scroll-arrow--disabled" : ""}`}
                        onClick={() => activeIndex < totalMeds - 1 && scrollToIndex(activeIndex + 1)}
                    >
                        <KeyboardArrowDownRoundedIcon />
                    </Box>
                </Box>
            )}
            <Box
                className="active-meds__meds-scroll"
                ref={scrollRef}
                onScroll={handleScroll}
            >
                {props.medications.map((med, index) => {
                    const daysRemaining = props.getDaysRemaining(props.prescribedAt, med.duration);
                    const totalDays = parseInt(med.duration || "1");
                    return (
                        <Box key={index} className="active-meds__med-item">
                            <Box className="active-meds__card-top">
                                <Tooltip title={med.medicationName ?? ""} arrow disableHoverListener={(med.medicationName?.length ?? 0) <= 20}>
                                    <Typography className="active-meds__med-name">
                                        {(med.medicationName?.length ?? 0) > 20
                                            ? `${med.medicationName!.slice(0, 20)}…`
                                            : med.medicationName}
                                    </Typography>
                                </Tooltip>
                                <Typography className="active-meds__strength">
                                    {med.strength}
                                </Typography>
                            </Box>

                            <Typography className="active-meds__dosage">
                                {med.dosage}, {med.frequency}
                            </Typography>

                            <Box className="active-meds__remaining">
                                <Box className="active-meds__remaining-info">
                                    <AccessTimeRoundedIcon />
                                    <Typography>
                                        {daysRemaining} days remaining
                                    </Typography>
                                </Box>
                                <Box className="active-meds__remaining-bar">
                                    <Box
                                        className="active-meds__remaining-progress"
                                        sx={{ width: `${(daysRemaining / totalDays) * 100}%` }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
            {showIndicators && (
                <Box className="active-meds__dots">
                    {props.medications.map((_, i) => (
                        <Box
                            key={i}
                            className={`active-meds__dot ${i === activeIndex ? "active-meds__dot--active" : ""}`}
                            onClick={() => scrollToIndex(i)}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

const ActiveMedications: React.FC = () => {
    const patientId = useAuth().user?.sub;
    const [activePrescriptions, setActivePrescriptions] = useState<ActiveMedicationsDto[]>([]);

    const getActiveMedications = (patientId: string) => {
        const url = `${GlobalSettings.patientRoute}/getActiveMedications/${patientId}`;
        axiosUtil.get<ActiveMedicationsDto[]>(url)
            .then(res => {
                setActivePrescriptions(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    }

    useEffect(() => {
        if (patientId)
            getActiveMedications(patientId);
    }, [patientId]);

    const getDaysRemaining = (prescribedAt: string, duration: string | null) => {
        if (!duration) return 0;
        const endDate = dayjs(prescribedAt).add(parseInt(duration), "day");
        const remaining = endDate.diff(dayjs(), "day");
        return Math.max(0, remaining);
    };

    return (
        <Box className="active-meds">
            <Box className="active-meds__header">
                <Box className="active-meds__header-left">
                    <MedicationRoundedIcon className="active-meds__header-icon" />
                    <Typography className="active-meds__title">
                        Active Medications
                    </Typography>
                </Box>
            </Box>

            <Box className="active-meds__list">
                {activePrescriptions.length === 0 && (
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 8,
                        gap: 0.5,
                        width: "100%",
                    }}>
                        <MedicationRoundedIcon sx={{ fontSize: "2.5rem", mb: 1, color: "#ef5350" }} />
                        <Typography sx={{ fontWeight: 600, color: "text.primary", fontSize: "1rem" }}>
                            No active medications
                        </Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                            You have no medications currently prescribed.
                        </Typography>
                    </Box>
                )}
                {activePrescriptions.map((prescription) => {
                    const [firstName, lastName] = prescription.doctorName.split(" ");
                    const avatarColor = getAvatarColor(firstName, lastName || "");
                    const initials = prescription.doctorName.split(" ").map(n => n.charAt(0)).join("");

                    return (
                        <Box key={prescription.prescriptionId} className="active-meds__card">
                            <Typography className="active-meds__diagnosis">
                                {prescription.diagnosis}
                            </Typography>

                            <Box className="active-meds__divider" />

                            <MedScroll
                                medications={prescription.medicationItems}
                                prescribedAt={prescription.prescribedAt}
                                getDaysRemaining={getDaysRemaining}
                            />

                            <Box className="active-meds__divider" />

                            <Box className="active-meds__card-footer">
                                <Box className="active-meds__doctor">
                                    <Avatar
                                        sx={{
                                            bgcolor: avatarColor.bg,
                                            color: avatarColor.color,
                                            width: 28,
                                            height: 28,
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {initials}
                                    </Avatar>
                                    <Typography className="active-meds__doctor-name">
                                        Dr. {prescription.doctorName}
                                    </Typography>
                                </Box>
                                <Typography className="active-meds__prescribed-date">
                                    {dayjs(prescription.prescribedAt).format("D MMMM YYYY")}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default ActiveMedications;