import "./AppointmentHistory.scss";
import {useEffect, useMemo, useState} from "react";
import { Box, Typography, Chip, Avatar } from "@mui/material";
import Grid from "@mui/material/Grid";
import MuiToolbar from "@mui/material/Toolbar";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import useAuth from "../../../../store/features/auth/authHook";
import dayjs from "dayjs";
import GlobalSettings from "../../../../GlobalSettings.json";
import axiosUtil from "../../../../common/axiosUtil";
import { getAvatarColor } from "../../../../common/avatarColorUtil";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import AppointmentDetailsDrawer from "./appDetailsDrawer/AppointmentDetailsDrawer";
import ReviewDialogContent from "./ReviewDialogContent";
import ShareIcon from "@mui/icons-material/Share";
import Button from "@mui/material/Button";
import CustomPopUp from "../../../../components/CustomPopUp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Tooltip from "@mui/material/Tooltip";
import AppointmentStatusEnumType from "../../../../enums/AppointmentStatusEnumType";

export type AppointmentHistoryDto = {
    appointmentId: string;
    institutionName: string;
    doctorName: string;
    address: string;
    specialty: string;
    startDateTime: string;
    service: string;
    hasReview: boolean;
    statusAppointment: AppointmentStatusEnumType;
};

type ActiveLinkStatusDto = {
    token: string;
    remainingSeconds: number;
};

type Props = {
    careUnregisteredPatientId?: string;
}


const AppointmentHistory = (props: Props) => {
    const patientId = useAuth()?.user?.sub;
    const [appointmentsHistory, setAppointmentHistory] = useState<AppointmentHistoryDto[]>([]);
    const [searched, setSearched] = useState<string>('');
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const [selectedAppId, setSelectedAppId] = useState<string>("");
    const [shareHistory, setShareHistory] = useState<boolean>(false);
    const [generatedLink, setGeneratedLink] = useState<string>("");
    const [confirmRevoke, setConfirmRevoke] = useState<boolean>(false);

    const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);
    const [reviewAppointmentId, setReviewAppointmentId] = useState<string>("");
    const [reviewRating, setReviewRating] = useState<number | null>(0);
    const [reviewComment, setReviewComment] = useState<string>("");
    const [reviewedInSession, setReviewedInSession] = useState<Set<string>>(new Set());

    const carePatientId = props.careUnregisteredPatientId ?? null;

    const filteredApp = useMemo(() => {
        if (searched === "")
            return appointmentsHistory;
        return appointmentsHistory.filter(x =>
            x.specialty.toLowerCase().includes(searched.toLowerCase()) ||
            x.doctorName.toLowerCase().includes(searched.toLowerCase())
        );
    }, [searched, appointmentsHistory]);

    const getStatusChipMeta = (status: AppointmentStatusEnumType): { label: string; className: string } => {
        switch (status) {
            case AppointmentStatusEnumType.Canceled:
                return { label: "Canceled", className: "canceled" };
            case AppointmentStatusEnumType.Missed:
                return { label: "Missed", className: "missed" };
            case AppointmentStatusEnumType.Confirmed:
                return { label: "Confirmed", className: "confirmed" };
            case AppointmentStatusEnumType.InProgress:
                return { label: "In progress", className: "in-progress" };
            case AppointmentStatusEnumType.Rescheduled:
                return { label: "Rescheduled", className: "rescheduled" };
            case AppointmentStatusEnumType.Completed:
            default:
                return { label: "Completed", className: "completed" };
        }
    };

    const getPastAppointments = (patientId: string) => {
        const url = `${GlobalSettings.patientRoute}/getAppointmentHistory/${patientId}`;
        axiosUtil.get<AppointmentHistoryDto[]>(url)
            .then(res => {
                setAppointmentHistory(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    };

    useEffect(() => {
        const id = props.careUnregisteredPatientId || patientId;
        if (id) getPastAppointments(id);
    }, [patientId, props.careUnregisteredPatientId]);

    const ShareHistoryContent = () => {
        return (
            <Box sx={{ p: 1 }}>
                <Typography sx={{ fontSize: "0.9rem", color: "#1a2e35" }}>
                    This link will be valid for <strong>1 hour</strong>. Anyone with it can view your full medical history. You can revoke access at any time.
                </Typography>
            </Box>
        );
    };

    const RevokeHistoryContent = () => {
        return (
            <Box sx={{ p: 1 }}>
                <Typography sx={{ fontSize: "0.9rem", color: "#1a2e35" }}>
                    Are you sure you want to revoke access? The external doctor will immediately lose access to your medical history.
                </Typography>
            </Box>
        );
    };

    const handleShare = () => {
        const url = `${GlobalSettings.patientRoute}/generateLink`;
        axiosUtil.post<string>(url, {
            patientId: patientId,
            careUnregisteredPatientId: carePatientId,
        }, {
            headers: { 'Content-Type': 'application/json' }
        })
            .then(res => {
                setGeneratedLink(`${window.location.origin}/shared/${res.data}`);
            })
            .catch(err => {
                console.error(err);
            });
    };

    useEffect(() => {
        if (patientId) {
            const url = `${GlobalSettings.patientRoute}/getActiveLinkStatus`;
            axiosUtil.post<ActiveLinkStatusDto>(url,{
                patientId: patientId,
                careUnregisteredPatientId: carePatientId,
            })
                .then(res => {
                    const data = res.data;
                    if (data && data.token && data.remainingSeconds > 0) {
                        setGeneratedLink(`${window.location.origin}/shared/${data.token}`);
                        setTimeout(() => {
                            setGeneratedLink("");
                        }, data.remainingSeconds * 1000);
                    }
                })
                .catch(err => {
                    console.error("Eroare la verificarea statusului:", err);
                });
        }
    }, [patientId, carePatientId]);

    const handleRevoke = () => {
        const url = `${GlobalSettings.patientRoute}/revokeSharedLink`;
        axiosUtil.put(url, {
            patientId: patientId,
            careUnregisteredPatientId: carePatientId,
        }, {
            headers: { 'Content-Type': 'application/json' }
        })
            .then(() => {
                setGeneratedLink("");
            })
            .catch(err => {
                console.error("Error:", err);
            });
    };

    const openReviewDialog = (appointmentId: string) => {
        setReviewAppointmentId(appointmentId);
        setReviewRating(0);
        setReviewComment("");
        setReviewDialogOpen(true);
    };

    const closeReviewDialog = () => {
        setReviewDialogOpen(false);
        setReviewAppointmentId("");
        setReviewRating(0);
        setReviewComment("");
    };

    const submitReview = () => {
        if (!reviewRating || reviewRating === 0) return;

        const url = `${GlobalSettings.patientRoute}/leaveReview`;
        axiosUtil.post(url, {
            patientId: patientId,
            appointmentId: reviewAppointmentId,
            rating: reviewRating,
            comment: reviewComment.trim() || null,
        }, {
            headers: { 'Content-Type': 'application/json' }
        })
            .then(() => {
                setReviewedInSession(prev => new Set(prev).add(reviewAppointmentId));
                closeReviewDialog();
            })
            .catch(err => {
                console.error("Error submitting review:", err);
            });
    };

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: { sm: "100%", md: "1700px" },
                padding: carePatientId ? 0 : { xs: 2, md: 3 },
                overflow: "hidden",
                height: carePatientId ? "100%" : "90vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {!carePatientId && <MuiToolbar disableGutters sx={{ flexShrink: 0 }} />}

            <Box sx={{ flexWrap: "wrap", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    {!carePatientId && (
                        <Typography
                            variant="h6"
                            component="h1"
                            sx={{ color: "text.primary", fontWeight: 500, fontSize: 24, flexShrink: 0 }}
                        >
                            Medical History
                        </Typography>
                    )}
                    {filteredApp.length !== 0 &&
                        <Button
                            onClick={() => generatedLink ? setConfirmRevoke(true) : setShareHistory(true)}
                            startIcon={<ShareIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                textTransform: "none",
                                fontSize: "0.78rem",
                                fontWeight: 500,
                                color: generatedLink ? "#d32f2f" : "#1565c0",
                                border: generatedLink ? "1px solid #ef5350" : "1px solid #90caf9",
                                borderRadius: "99px",
                                padding: "6px 16px",
                                background: generatedLink ? "#ffebee" : "#e3f2fd",
                                "&:hover": {
                                    background: generatedLink ? "#ffcdd2" : "#bbdefb",
                                    borderColor: generatedLink ? "#d32f2f" : "#1565c0",
                                }
                            }}
                        >
                            {generatedLink ? "Revoke access" : "Share History"}
                        </Button>
                    }
                    {generatedLink && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: { xs: 0, sm: 1 } }}>
                            <Typography
                                sx={{
                                    fontSize: "0.82rem",
                                    color: "#2e7d32",
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    whiteSpace: "nowrap"
                                }}
                            >
                                <Box component="span" sx={{ width: 8, height: 8, bgcolor: "#2e7d32", borderRadius: "50%" }} />
                                Active Access
                            </Typography>
                            <Tooltip title="Copy history link to clipboard">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => navigator.clipboard.writeText(generatedLink)}
                                    startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                                    sx={{
                                        textTransform: "none",
                                        fontSize: "0.75rem",
                                        color: "#5f6368",
                                        borderColor: "#e0e0e0",
                                        borderRadius: "6px",
                                        px: 1.5,
                                        py: 0.5,
                                        "&:hover": {
                                            bgcolor: "#f5f5f5",
                                            borderColor: "#bdbdbd"
                                        }
                                    }}
                                >
                                    Copy Link
                                </Button>
                            </Tooltip>
                        </Box>
                    )}
                </Box>
                {filteredApp.length !== 0 &&
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
                }
            </Box>
            {filteredApp.length === 0 && (
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 8,
                    gap: 0.5,
                    width: "100%",
                    opacity: 0.5,
                }}>
                    <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>📋</Typography>
                    <Typography sx={{ fontWeight: 600, color: "text.primary", fontSize: "1rem" }}>
                        No appointment history
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                        {searched ? "No results found for your search." : "You have no past appointments."}
                    </Typography>
                </Box>
            )}
            <Box sx={{
                flex: 1,
                px: { xs: 1, md: 2 },
                overflowY: carePatientId ? "auto" : "unset",
                overflowX: "hidden",
            }}>
                <Grid
                    container
                    spacing={2}
                    sx={{
                        overflowY: carePatientId ? "unset" : "auto",
                        maxHeight: carePatientId ? "unset" : "75vh",
                        alignContent: "flex-start",
                        marginRight: "20px",
                        marginLeft: "-13px"
                    }}
                >
                    {filteredApp.map((appt) => {
                        const initials = appt.doctorName
                            .split(" ")
                            .map((n) => n.charAt(0))
                            .join("");
                        const [firstName, ...lastNameParts] = appt.doctorName.trim().split(/\s+/);
                        const lastName = lastNameParts.join(" ");
                        const avatarColor = getAvatarColor(firstName, lastName || "");
                        const dt = dayjs(appt.startDateTime);
                        const isReviewed = appt.hasReview || reviewedInSession.has(appt.appointmentId);
                        const statusChipMeta = getStatusChipMeta(appt.statusAppointment);
                        console.log(appt.doctorName.split(" "));
                        return (
                            <Grid
                                key={appt.appointmentId}
                                size={{ xs: 12, sm: 6, md: 3 }}
                            >
                                <Box className="past-appts__card">
                                    <Box className="past-appts__card-top">
                                        <Box className="past-appts__card-top-row">
                                            <Typography className="past-appts__datetime">
                                                {dt.format("ddd, D MMM YYYY")} · {dt.format("HH:mm")}
                                            </Typography>
                                            <Chip
                                                label={statusChipMeta.label}
                                                size="small"
                                                className={`past-appts__status-tag past-appts__status-tag--${statusChipMeta.className}`}
                                            />
                                        </Box>
                                        <Typography className="past-appts__specialty">
                                            {appt.specialty}
                                        </Typography>
                                        <Typography className="past-appts__clinic">
                                            {appt.institutionName}
                                        </Typography>

                                        <Typography className="past-appts__address">
                                            {appt.address}
                                        </Typography>
                                    </Box>
                                    <Box className="past-appts__card-bottom">
                                        <Avatar
                                            sx={{
                                                bgcolor: avatarColor?.bg,
                                                color: avatarColor?.color,
                                                width: 32,
                                                height: 32,
                                                fontSize: "0.7rem",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {initials}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography className="past-appts__doctor-name">
                                                Dr. {appt.doctorName}
                                            </Typography>
                                        </Box>
                                        <Box onClick={() => {
                                            setOpenDetails(true);
                                            setSelectedAppId(appt.appointmentId);
                                        }} className="past-appts__arrow">
                                            <ChevronRightIcon
                                                sx={{
                                                    fontSize: 14,
                                                    color: "#2d655f",
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {appt.statusAppointment === AppointmentStatusEnumType.Completed && !appt.hasReview && (
                                        <Box className="past-appts__review-section">
                                            {isReviewed ? (
                                                <Box className="past-appts__review-submitted">
                                                    <StarRoundedIcon sx={{ fontSize: 14, color: "#f5a623" }} />
                                                    <Typography className="past-appts__review-submitted-text">
                                                        Review submitted
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Button
                                                    onClick={() => openReviewDialog(appt.appointmentId)}
                                                    startIcon={<StarRoundedIcon sx={{ fontSize: 16 }} />}
                                                    className="past-appts__review-button"
                                                >
                                                    Leave a review
                                                </Button>
                                            )}
                                        </Box>
                                    )}
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
            />
            <CustomPopUp
                open={shareHistory}
                setOpen={setShareHistory}
                title="Share your medical history"
                contentComponent={ShareHistoryContent}
                showActions={true}
                textButton={"Generate Link"}
                onClickCallback={handleShare}
                width="400px"
            />
            <CustomPopUp
                open={confirmRevoke}
                setOpen={setConfirmRevoke}
                title="Revoke Access"
                contentComponent={RevokeHistoryContent}
                showActions={true}
                textButton={"Yes, Revoke"}
                onClickCallback={() => {
                    handleRevoke();
                    setConfirmRevoke(false);
                }}
                width="400px"
            />
            <CustomPopUp
                open={reviewDialogOpen}
                setOpen={(nextOpen: boolean) => {
                    if (!nextOpen) closeReviewDialog();
                }}
                title="Rate your appointment"
                contentComponent={ReviewDialogContent}
                dataComponent={{
                    rating: reviewRating,
                    comment: reviewComment,
                    onRatingChange: setReviewRating,
                    onCommentChange: setReviewComment,
                }}
                showActions={true}
                textButton={"Submit review"}
                disableActionButton={!reviewRating || reviewRating === 0}
                onClickCallback={submitReview}
                width="420px"
            />
        </Box>
    );
};

export default AppointmentHistory;