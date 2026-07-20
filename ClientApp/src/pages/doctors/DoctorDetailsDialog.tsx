import {
    Box, Avatar, Typography, Button, Stack, TextField,
    Divider, IconButton, Dialog, CircularProgress
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type {Specialty} from "../signUp/formSignUp/FormSignUp";
import {useEffect, useMemo, useState} from "react";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import Autocomplete from "@mui/material/Autocomplete";
import type {InstitutionService, SpecialtyServices} from "../services/ServicesPage";
import type {
    AvailableSlotDto
} from "../dashboard/dashboardAdminLocal/mainGridLocal/appointmentsView/CreateAppointmentView";
import dayjs, {type Dayjs} from "dayjs";
import DateTimeFormat from "../../common/dateTimeUtil";
import useAuth from "../../store/features/auth/authHook";
import type {BookingFor} from "../careGiving/CareGiving";
import { toast } from 'react-toastify';

type DoctorInfo = {
    id: string;
    name: string;
    doctorSpecialties: Specialty[];
    rating: number;
    totalReviews: number;
}

type Props = {
    doctor: DoctorInfo | null;
    onClose: () => void;
    institutionId: string;
    onConfirmed: () => void;
    bookingFor?: BookingFor;
}

type AvailableSlotsDoctorResponse = {
    doctorId: string;
    slotsAvailable: AvailableSlotDto[];
}


export default function DoctorDetailsDialog({ doctor, onClose, institutionId, onConfirmed, bookingFor }: Props) {
    const patientId = useAuth().user?.sub;
    const [doctorSpecialtiesWithServices, setDoctorSpecialtiesWithServices] = useState<SpecialtyServices[]>([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
    const [availableSlotsDoctor, setAvailableSlotsDoctor] = useState<AvailableSlotsDoctorResponse | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<InstitutionService | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [referralCode, setReferralCode] = useState<string>('');

    const filteredServices = useMemo(() => {
        if(!selectedSpecialty || doctorSpecialtiesWithServices.length === 0)
        {
            return [];
        }
        return doctorSpecialtiesWithServices.find((x) => x.specialtyId === selectedSpecialty?.id)?.institutionServices ?? [];
    }, [doctorSpecialtiesWithServices, selectedSpecialty])

    const getSpecialtyServicesByDoctor = (doctorId: string) => {
        const url = `${GlobalSettings.doctorRoute}/getSpecialtyServicesByDoctor/${doctorId}/${institutionId}`;
        axiosUtil.get<SpecialtyServices[]>(url)
            .then (res => {
                setDoctorSpecialtiesWithServices(res.data);
                // setLoading(false);
            })
            .catch(err => {
                console.error(err);
            })
    }

    useEffect(() => {
        if(doctor?.id)
            getSpecialtyServicesByDoctor(doctor?.id)
    }, [doctor?.id]);

    const getAvailableSlotsDoctor = () => {
        setLoadingSlots(true);
        const req = {
            doctorId: doctor?.id,
            institutionId: institutionId,
            specialtyId: selectedSpecialty?.id,
            serviceId: selectedServiceId?.serviceId,
            from: selectedDate.startOf("day").format('YYYY-MM-DDTHH:mm:ss'),
            to: selectedDate.endOf("day").format('YYYY-MM-DDTHH:mm:ss'),
        }
        const url = `${GlobalSettings.institutionRoute}/getAvailableSlotsDoctor`;
        axiosUtil.post<AvailableSlotsDoctorResponse>(url, req)
            .then (res => {
                setAvailableSlotsDoctor(res.data);
                setLoadingSlots(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingSlots(false);
            })
    }

    const createAppointment = () => {
        const url = `${GlobalSettings.appointmentRoute}/addAppointment`;
        const req = {
            ...(bookingFor
                    ? { unregisteredPatientId: bookingFor.careUnregisteredPatientId }
                    : { patientId: patientId }
            ),
            institutionId: institutionId,
            specialtyId: selectedSpecialty?.id,
            serviceId: selectedServiceId?.serviceId,
            doctorId: doctor?.id,
            startTime: selectedTime,
            referralCode: referralCode,
        };

        axiosUtil.post<boolean>(url, req)
            .then (res => {
               onClose();
                onConfirmed();
            })
            .catch(err => {
                console.error(err);
            })
    }

    return (
        <Dialog
            open={!!doctor}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            // fullScreen={isMobile}
            PaperProps={{
                sx: {
                    overflow: "auto",
                    borderRadius: "16px",
                },
            }}
        >
            {doctor && (
                <Box>
                    <Box sx={{
                        background: "linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)",
                        p: 3,
                        pb: 2.5,
                    }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor: "#e8f5e9",
                                        color: "#2e7d32",
                                        fontWeight: 700,
                                        fontSize: 24,
                                        border: "2px solid #fff",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    {doctor.name.split(" ").map((w) => w[0]).join("")}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        Dr. {doctor.name}
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <StarIcon sx={{ color: "#FFC107", fontSize: 16 }} />
                                        <Typography variant="body2" fontWeight={600}>
                                            {doctor.rating}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            ({doctor.totalReviews} reviews)
                                        </Typography>
                                    </Stack>

                                </Box>
                            </Stack>
                            <IconButton onClick={onClose} sx={{ color: "#6b7280" }}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
                            <Typography variant="subtitle1" fontWeight={700}>
                                Book an appointment
                            </Typography>
                            {bookingFor && (
                                <Box sx={{
                                    px: 1.5,
                                    py: 0.4,
                                    borderRadius: "99px",
                                    background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                                    border: "1px solid #ffcc80",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.6,
                                }}>
                                    <Typography sx={{ fontSize: "0.65rem", color: "#e65100", fontWeight: 600 }}>
                                        👤 for:
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.7rem", color: "#bf360c", fontWeight: 700 }}>
                                        {bookingFor.name}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: "block" }}>
                            SPECIALTY
                        </Typography>
                        <Autocomplete
                            onChange={(_, newValue) => setSelectedSpecialty(newValue)}
                            options={doctor.doctorSpecialties}
                            getOptionLabel={(option) => option.name}
                            size="small"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select specialty"
                                    sx={{
                                        mb: 2,
                                        "& .MuiOutlinedInput-root": { borderRadius: "14px" },
                                        "& .MuiInputBase-input": { fontSize: "16px" },
                                    }}
                                />
                            )}
                        />

                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: "block" }}>
                            SERVICE
                        </Typography>
                        <Autocomplete
                            value={selectedServiceId}
                            onChange={(_, newValue) => setSelectedServiceId(newValue)}
                            options={filteredServices}
                            getOptionLabel={(option) => option.name}
                            size="small"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select a service"
                                    sx={{
                                        mb: 2,
                                        "& .MuiOutlinedInput-root": { borderRadius: "14px" },
                                        "& .MuiInputBase-input": { fontSize: "16px" },
                                    }}
                                />
                            )}
                        />

                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: "block" }}>
                                PREFERRED DATE
                            </Typography>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    disablePast
                                    value={selectedDate}
                                    onChange={(newDate) => {
                                        if (newDate) {
                                            setSelectedDate(newDate);
                                        }
                                    }}
                                    format="DD/MM/YYYY"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: "outlined",
                                            InputProps: {
                                                sx: {
                                                    height: 43,
                                                    borderRadius: "14px",
                                                    backgroundColor: "#fcfdff",
                                                    marginBottom: 3,
                                                },
                                            },
                                            sx: {
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#dbe3ee",
                                                },
                                                "& .MuiInputBase-input": {
                                                    fontSize: "14px",
                                                    color: "#0f172a",
                                                },
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Box>

                        <Button
                            onClick={()=> {
                                setSelectedTime("")
                                setHasSearched(true)
                                getAvailableSlotsDoctor()}}
                            fullWidth
                            variant="contained"
                            disableElevation
                            sx={{
                                mb: 3,
                                borderRadius: "16px",
                                textTransform: "none",
                                fontWeight: 600,
                                background: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
                                color: "#0d47a1",
                                py: 1.2,
                                "&:hover": {
                                    background: "linear-gradient(120deg, #8cb0ea 0%, #75bada 100%)",
                                    boxShadow: "0 4px 12px rgba(117, 186, 218, 0.4)",
                                },
                            }}
                        >
                            Find available slots
                        </Button>

                        <Divider sx={{ mb: 2 }} />

                        {loadingSlots ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4}}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {hasSearched && availableSlotsDoctor && availableSlotsDoctor?.slotsAvailable.length > 0 &&
                                    <Box sx={{paddingBottom: "1px"}}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: "block" }}>
                                            AVAILABLE SLOTS
                                        </Typography>
                                        <Box sx={{ maxHeight: 140, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                                            {availableSlotsDoctor?.slotsAvailable.map((slot, index) => (
                                                <Button
                                                    onClick={() => setSelectedTime(slot.start)}
                                                    key={index}
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: "8px",
                                                        borderColor: "#e5e7eb",
                                                        color: "#374151",
                                                        fontWeight: 500,
                                                        background: selectedTime === slot.start ? "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)" : "",
                                                        "&:hover": {
                                                            background: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
                                                            borderColor: "transparent",
                                                            color: "#fff",
                                                        },

                                                    }}
                                                >
                                                    {DateTimeFormat.timeFormat(slot.start)}
                                                </Button>
                                            ))}
                                        </Box>
                                        {selectedTime != "" &&
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: "block" }}>
                                                    REFERRAL CODE (OPTIONAL)
                                                </Typography>
                                                <TextField
                                                    onChange={(e) => setReferralCode(e.target.value)}
                                                    fullWidth
                                                    size="small"
                                                    placeholder="Enter code"
                                                    sx={{
                                                        mb: 2,
                                                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                                                    }}
                                                />
                                                <Button
                                                    onClick={() => createAppointment()}
                                                    fullWidth
                                                    variant="contained"
                                                    disableElevation
                                                    sx={{
                                                        borderRadius: "10px",
                                                        textTransform: "none",
                                                        fontWeight: 600,
                                                        background: "#d7f1d8",
                                                        color: "#2E7D32",
                                                        py: 1.2,
                                                        "&:hover": {
                                                            background: "#C8E6C9",
                                                        },
                                                    }}
                                                >
                                                    Confirm appointment
                                                </Button>
                                            </Box>
                                        }
                                    </Box>
                                }

                                {hasSearched && (!availableSlotsDoctor || availableSlotsDoctor?.slotsAvailable.length === 0) &&
                                    <Typography variant="body2" color="text.secondary" align="center" mb={2}>
                                        No available slots
                                    </Typography>
                                }
                            </>
                        )}

                    </Box>
                </Box>
            )}
        </Dialog>
    );
}