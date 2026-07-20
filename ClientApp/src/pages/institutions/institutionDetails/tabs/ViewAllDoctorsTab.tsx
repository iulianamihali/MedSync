import {Box, Avatar, Typography, Button, Stack, Chip, TextField, InputAdornment, Alert, Snackbar} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import SearchIcon from "@mui/icons-material/Search";
import React, {useEffect, useMemo, useState} from "react";
import type {Specialty} from "../../../signUp/formSignUp/FormSignUp";
import GlobalSettings from "../../../../GlobalSettings.json";
import axiosUtil from "../../../../common/axiosUtil";
import DoctorDetailsDialog from "../../../doctors/DoctorDetailsDialog";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import type {BookingFor} from "../../../careGiving/CareGiving";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CustomPopUp from "../../../../components/CustomPopUp";
import DoctorReviewsModal from "../../../../components/DoctorReviewsModal";

type Props = {
    institutionId: string;
    bookingFor?: BookingFor;
}

type DoctorInfo = {
    id: string;
    name: string;
    doctorSpecialties: Specialty[];
    rating: number;
    totalReviews: number;
}

export default function ViewAllDoctorsTab(props: Props) {
    const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
    const [search, setSearch] = useState<string>("");
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfo | null>(null);
    const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
    const [openReviews, setOpenReviews] = useState(false);
    const [selectedReviewsDoctor, setSelectedReviewsDoctor] = useState<DoctorInfo | null>(null);

    const filteredDoctors = useMemo(() => {
        if(search === "") return doctors;
        const lower = search.toLowerCase();
        return doctors.filter((x) =>
            x.name.toLowerCase().includes(lower) ||
            x.doctorSpecialties.some((s) => s.name.toLowerCase().includes(lower))
        );
    }, [search, doctors])

    const getDoctors = (institutionId: string) => {
        // setIsLoading(true);

        const url = `${GlobalSettings.institutionRoute}/getDoctorsTab/${institutionId}`;
        axiosUtil.get<DoctorInfo[]>(url)
            .then (res => {
                setDoctors(res.data);
                // setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                // setIsLoading(false);
            })
    }

    useEffect(() => {
        if (props.institutionId)
            getDoctors(props.institutionId);
    }, [props.institutionId]);

    return (
        <Box>
            <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by doctor name or specialty..."
                fullWidth
                size="small"
                sx={{
                    mt: 3,
                    mb: 2,
                    maxWidth: 400,
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon  sx={{ color: "#9ca3af" }} />
                        </InputAdornment>
                    ),
                }}
            />

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 3,
                    maxHeight: "calc(100vh - 430px)",
                    overflowY: "auto",
                    pr: 1,
                }}
            >
                {filteredDoctors.map((doctor) => (
                    <Box
                        key={doctor.id}
                        sx={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "14px",
                            p: 2.5,
                            backgroundColor: "#fff",
                            transition: "box-shadow 0.2s ease",
                            "&:hover": {
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                            },
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
                            <Avatar
                                sx={{
                                    width: 56,
                                    height: 56,
                                    bgcolor: "#e8f5e9",
                                    color: "#2e7d32",
                                    fontWeight: 700,
                                    fontSize: 20,
                                }}
                            >
                                {doctor.name.split(" ").map((w) => w[0]).join("")}
                            </Avatar>

                            <Box>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    Dr. {doctor.name}
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                    {doctor.doctorSpecialties.map((spec) => (
                                        <Chip
                                            key={spec.id}
                                            label={spec.name}
                                            size="small"
                                            sx={{
                                                fontSize: 11,
                                                height: 24,
                                                backgroundColor: "#f0f4ff",
                                                color: "#3b5998",
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                            <StarIcon sx={{ color: "#FFC107", fontSize: 18 }} />
                            <Typography variant="body2" fontWeight={600}>
                                {doctor.rating}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ({doctor.totalReviews} reviews)
                            </Typography>
                            {doctor.totalReviews > 0 && (
                                <Typography
                                    variant="body2"
                                    color="primary"
                                    onClick={() => {
                                        setSelectedReviewsDoctor(doctor);
                                        setOpenReviews(true);
                                    }}
                                    sx={{
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.3,
                                        "&:hover": { textDecoration: "underline" }
                                    }}
                                >
                                    See all
                                    <ArrowForwardIosIcon sx={{ fontSize: 11 }} />
                                </Typography>
                            )}
                        </Stack>

                        <Button
                            onClick={() => {
                                setSelectedDoctor(doctor)
                            }}
                            fullWidth
                            variant="outlined"
                            sx={{
                                mt: 1,
                                borderRadius: "10px",
                                textTransform: "none",
                                fontWeight: 600,
                                borderColor: "#d1d5db",
                                color: "#374151",
                                "&:hover": {
                                    borderColor: "#80cbc4",
                                    backgroundColor: "#f0fdfa",
                                    color: "#00796b",
                                },
                            }}
                        >
                            View details
                        </Button>
                    </Box>
                ))}
            </Box>
            {selectedDoctor &&
                (
                    <DoctorDetailsDialog
                                        bookingFor={props.bookingFor}
                                        doctor={selectedDoctor}
                                         onClose={() => setSelectedDoctor(null)}
                                         institutionId={props?.institutionId}
                                         onConfirmed={() => setSnackBarOpen(true)}
                    />
                )
            }
            <Snackbar
                open={snackBarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackBarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackBarOpen(false)}
                    severity="success"
                    variant="filled"
                    icon={<CheckCircleOutlineIcon sx={{ color: '#fff' }} />}
                    sx={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(67, 233, 123, 0.35)',
                    }}
                >
                    Your appointment has been successfully confirmed!
                </Alert>
            </Snackbar>

            {selectedReviewsDoctor && (
                <CustomPopUp
                    open={openReviews}
                    setOpen={setOpenReviews}
                    title={`Dr. ${selectedReviewsDoctor.name} — Reviews`}
                    contentComponent={DoctorReviewsModal as React.ComponentType<Record<string, unknown>>}
                    dataComponent={{
                        doctorId: selectedReviewsDoctor.id,
                        institutionId: props.institutionId
                    }}
                    showActions={false}
                    width="50vw"
                />
            )}

        </Box>
    );
}