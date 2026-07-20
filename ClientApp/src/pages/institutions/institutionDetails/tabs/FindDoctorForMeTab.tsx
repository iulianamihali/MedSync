import "./FindDoctorForMeTab.scss";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type {
    Service,
    SpecialtyWithServices
} from "../../../dashboard/dashboardAdminLocal/mainGridLocal/appointmentsView/CreateAppointmentView";
import {useEffect, useState} from "react";
import GlobalSettings from "../../../../GlobalSettings.json";
import axiosUtil from "../../../../common/axiosUtil";
import dayjs, {type Dayjs} from "dayjs";
import type {CheckAvailabilityDoctorsResponse} from "../../../appointments/types";
import {Alert, CircularProgress, Snackbar} from "@mui/material";
import AvailableDoctorCard from "../../../doctors/AvailableDoctorCard";
import type {Specialty} from "../../../signUp/formSignUp/FormSignUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import type {BookingFor} from "../../../careGiving/CareGiving";

type Props = {
    institutionId?: string;
    bookingFor?: BookingFor;
}

export default function FindDoctorForMeTab(props: Props) {
    const [institutionSpecialtiesWithServices, setInstitutionSpecialtiesWithServices] = useState<SpecialtyWithServices[]>([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyWithServices | null>(null);
    const servicesBySelectedSpecialty = institutionSpecialtiesWithServices.find((x) => x.specialtyId === selectedSpecialty?.specialtyId);
    const [selectedServiceId, setSelectedServiceId] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [availableDoctors, setAvailableDoctors] = useState<CheckAvailabilityDoctorsResponse[]>([]);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);

    const sendSpecialty: Specialty = {
        id: selectedSpecialty?.specialtyId ?? "",
        name: selectedSpecialty?.specialtyName ?? "",
    };

    const sendService: Service =  {
        id: selectedServiceId?.id ?? "",
        name: selectedServiceId?.name ?? "",
        price: selectedServiceId?.price ?? 0,
    };


    const getSpecialties = (institutionId: string) => {
        const url = `${GlobalSettings.institutionRoute}/getSpecialtiesWithServices/${institutionId}`;
        axiosUtil.get<SpecialtyWithServices[]>(url)
            .then (res => {
                setInstitutionSpecialtiesWithServices(res.data);
            })
            .catch(err => {
                console.error(err);
            })

    }

    useEffect(() => {
        if(props.institutionId)
            getSpecialties(props.institutionId)
    }, [props.institutionId]);

    const getAvailableDoctors = () => {
        setIsLoading(true);
        const req = {
            institutionId: props?.institutionId,
            specialtyId: selectedSpecialty?.specialtyId,
            serviceId: selectedServiceId?.id,
            from: selectedDate.startOf("day").format('YYYY-MM-DDTHH:mm:ss'),
            to: selectedDate.endOf("day").format('YYYY-MM-DDTHH:mm:ss'),
        }
        const url = `${GlobalSettings.institutionRoute}/getAvailableDoctors`;
        axiosUtil.post<CheckAvailabilityDoctorsResponse[]>(url, req)
            .then (res => {
               setAvailableDoctors(res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            })
    }


    return (
        <Box className="find-doctor-tab">
            <Box className="find-doctor-card">
                <Box className="find-doctor-heading">
                    <Typography className="find-doctor-title">
                        Let us find the best doctor for you
                    </Typography>

                    <Typography className="find-doctor-subtitle">
                        Select your preferences and we'll match you with available doctors.
                    </Typography>
                </Box>

                <Box className="find-doctor-fields">
                    <Box className="find-doctor-field">
                        <Typography className="find-doctor-label">
                            Specialty
                        </Typography>

                        <Autocomplete
                            options={institutionSpecialtiesWithServices}
                            getOptionLabel={(option) => option.specialtyName}
                            value={selectedSpecialty}
                            onChange={(_, newValue) =>
                            {
                                setSelectedSpecialty(newValue);
                                setSelectedServiceId(null);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select specialty"
                                    variant="outlined"
                                    fullWidth
                                />
                            )}
                        />
                    </Box>

                    <Box className="find-doctor-field">
                        <Typography className="find-doctor-label">
                            Services / Investigations
                        </Typography>

                        <Autocomplete
                            options={servicesBySelectedSpecialty ? servicesBySelectedSpecialty.services : []}
                            value={selectedServiceId}
                            onChange={(_, newValue) => setSelectedServiceId(newValue)}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={selectedServiceId === null ? "Choose one or more services" : ''}
                                    variant="outlined"
                                />
                            )}
                        />
                    </Box>

                    <Box className="find-doctor-field">
                        <Typography className="find-doctor-label">
                            Preferred date
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
                                                height: 52,
                                                borderRadius: "14px",
                                                backgroundColor: "#fcfdff",
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
                </Box>

                <Box className="find-doctor-actions">
                    <Button
                        onClick={() => {
                            getAvailableDoctors();
                            setHasSearched(true);
                        }}
                        className="find-doctor-button"
                    >
                        Check availability
                    </Button>
                </Box>
            </Box>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
                ) : (
                    <>
            {hasSearched && availableDoctors.length > 0 && (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 3,
                    mt: 3
                }}>
                    {availableDoctors.map((x, i) => (
                        <AvailableDoctorCard key={`${x.id}-${i}`} availableDoctor={x}
                                             selectedDate={selectedDate}
                                             specialty={sendSpecialty}
                                             service={sendService}
                                             institutionId={props?.institutionId || ""}
                                             onConfirmed={() => setSnackBarOpen(true)}
                                             bookingFor={props.bookingFor}
                        />
                    ))}
                </Box>
            ) }
            {hasSearched && availableDoctors.length === 0 && (
            <Box sx={{
                py: 4,
                px: 2,
                mt: 4,
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
            }}>
                <Typography variant="body1" color="text.primary" fontWeight="500">
                    No doctors available for the selected criteria.
                </Typography>
            </Box>)}
</>
            )}
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
        </Box>
    );
}