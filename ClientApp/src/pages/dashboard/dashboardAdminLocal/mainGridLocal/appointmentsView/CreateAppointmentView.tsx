import './CreateAppointmentView.scss';
import {
    Box,
    Stack,
    Typography,
    alpha, FormControl, MenuItem,
    Button,
    Stepper,
    Step,
    StepLabel, Divider, FormControlLabel, Checkbox,
} from "@mui/material";
import Select from "@mui/material/Select";
import {useEffect, useState} from "react";
import GlobalSettings from "../../../../../GlobalSettings.json";
import axiosUtil from "../../../../../common/axiosUtil";
import useAuth from "../../../../../store/features/auth/authHook";
import DoctorAvailabilityCard from "./doctorAvailabilityCard/DoctorAvailabilityCard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, {type Dayjs} from "dayjs";
import {Collapse} from "@mui/material";
import {TextField} from "@mui/material";
import {Check} from "@mui/icons-material";
import Grid from '@mui/material/Grid';
import {PersonAddOutlined} from "@mui/icons-material";
import DateTimeFormat from "../../../../../common/dateTimeUtil";
import {CircularProgress} from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

type Props = {
    onSuccess: () => void;
}

export type SpecialtyWithServices = {
    specialtyId: string;
    specialtyName: string;
    services: Service[];
}
export type Service = {
    id: string;
    name: string;
    price: number;
}
export type DoctorDto = {
    id: string;
    name: string;
    slots: AvailableSlotDto[];
}
export type AvailableSlotDto = {
    start: string;
    end: string;
}
export type SelectedSlot = {
    doctorId: string;
    startTime: string;
}
export type SearchPatient = {
    id: string;
    name: string;
    isRegistered: boolean;
}

export default function CreateAppointmentView (props: Props){
    const auth = useAuth();
    const ins = auth.user?.ins;
    const [specialtiesWithServices, setSpecialtiesWithServices] = useState<SpecialtyWithServices[]>([]);
    const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [doctors, setDoctors] = useState<DoctorDto[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
    const [activeStep, setActiveStep] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [showCalendar, setShowCalendar] = useState(false);
    const selectedSpecialty = specialtiesWithServices.find(
        s => s.specialtyId === selectedSpecialtyId
    );
    const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
    const [phoneInput, setPhoneInput] = useState<string>("");
    const [searchPatients, setSearchPatients] = useState<SearchPatient | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [statusAddAppointment, setStatusAddAppointment] = useState<boolean>(false);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [cnp, setCnp] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [hasReferral, setHasReferral] = useState<boolean>(false);
    const [referralCode, setReferralCode] = useState<string>("");
    const services = selectedSpecialty?.services ?? [];
    const selectedService = selectedSpecialty?.services.find(
        s => s.id === selectedServiceId
    );
    const getSpecialties = () => {
        if(!ins)
            return;
        const url = `${GlobalSettings.institutionRoute}/getSpecialtiesWithServices/${ins}`;
        axiosUtil.get<SpecialtyWithServices[]>(url)
            .then (res => {
                setSpecialtiesWithServices(res.data);
            })
            .catch(err => {
                console.error(err);
            })

    }
    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };
    useEffect(() => {
        if(ins)
            getSpecialties();
    }, [ins]);

    const getDoctors = () => {
        setLoadingDoctors(true);
        const from = selectedDate.startOf("day").toDate();
        const to = selectedDate.endOf("day").toDate();
        const req = {
            institutionId: ins,
            specialtyId: selectedSpecialtyId,
            serviceId: selectedServiceId,
            from: selectedDate.startOf("day").format('YYYY-MM-DDTHH:mm:ss'),
            to: selectedDate.endOf("day").format('YYYY-MM-DDTHH:mm:ss'),
        }

        const url = `${GlobalSettings.institutionRoute}/getDoctors`;
        axiosUtil.post<DoctorDto[]>(url, req)
            .then (res => {
                setDoctors(res.data);
                setLoadingDoctors(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingDoctors(false);
            })
    }

    const doctor = doctors.find(d => d.id === selectedSlot?.doctorId);
    const searchPatient = (cnp: string, phoneNumber: string) => {
        const req = {
            cnp: cnp,
            phoneNumber: phoneNumber,
        }
        const url = `${GlobalSettings.institutionRoute}/searchPatientsByPhone`;
        axiosUtil.post<SearchPatient>(url, req)
            .then (res => {
                if(!res?.data)
                {
                    setSearchPatients(null);
                }
                else
                {
                    setSearchPatients(res.data);
                }
                setHasSearched(true);
            })
            .catch(err => {
                console.error(err);
            })
    }

    useEffect(() => {
        if(phoneInput.length === 13)
        {
            setCnp(phoneInput);
            searchPatient(phoneInput, "");
            setHasSearched(true);
        }
        else if(phoneInput.length == 10)
        {
            setCnp("");
            searchPatient("", phoneInput);
            setHasSearched(true);
        }
        else
        {
            setHasSearched(false);
            setSearchPatients(null);
        }
    }, [phoneInput]);

    useEffect(() => {
        if(activeStep == 2 &&
            selectedSpecialtyId &&
            selectedServiceId &&
            selectedDate)
            getDoctors();
    }, [activeStep, selectedSpecialtyId, selectedServiceId, selectedDate]);

    const addAppointment = () => {
        const url = `${GlobalSettings.appointmentRoute}/addAppointment`;
        let req;
        if(searchPatients?.isRegistered === true)
        {
            req = {
                patientId: searchPatients?.id,
                institutionId: ins,
                specialtyId: selectedSpecialtyId,
                serviceId: selectedServiceId,
                doctorId: selectedSlot?.doctorId,
                startTime: selectedSlot?.startTime,
                referralCode: referralCode,
            };
        }
        else if (searchPatients?.isRegistered === false)
        {
            req = {
                unregisteredPatientId: searchPatients?.id,
                institutionId: ins,
                specialtyId: selectedSpecialtyId,
                serviceId: selectedServiceId,
                doctorId: selectedSlot?.doctorId,
                startTime: selectedSlot?.startTime,
                referralCode: referralCode,
            };
        }
        else
        {
            req = {
                phoneNumber: phoneInput,
                institutionId: ins,
                specialtyId: selectedSpecialtyId,
                serviceId: selectedServiceId,
                doctorId: selectedSlot?.doctorId,
                startTime: selectedSlot?.startTime,
                firstName: firstName,
                lastName: lastName,
                cnp: cnp,
                email: email,
                referralCode: referralCode,
            };
        }
        axiosUtil.post<SearchPatient>(url, req)
            .then (res => {
                setStatusAddAppointment(true);
                props.onSuccess();
            })
            .catch(err => {
                console.error(err);
                setStatusAddAppointment(false);
            })
    }
    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                        borderLeft: (theme) => `2px solid ${theme.palette.primary.main}`
                    }}
                >
                    <Stepper activeStep={activeStep}  sx={{
                        mb: 3,
                        '& .MuiStepIcon-root.Mui-active': {
                            color: '#5B9FD8',
                        },
                        '& .MuiStepIcon-root.Mui-completed': {
                            color: '#10b981',
                        }
                    }}>
                        <Step>
                            <StepLabel>Patient</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Service</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Appointment time</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Final details</StepLabel>
                        </Step>
                    </Stepper>
                </Box>
                {activeStep === 0 && (
                    <Stack spacing={2}>
                        <TextField
                        label="Search patient by CNP/phone number"
                        fullWidth
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        InputProps={{
                            sx: {
                                borderRadius: 2,
                                backgroundColor: '#fafafa',
                                maxWidth: searchPatients?.name ? 470 : 320,
                            }
                        }}
                        />
                        {searchPatients !== null && (
                            <Box
                                sx={{
                                    mt: 2.5,
                                    px: 3,
                                    py: 1.75,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    borderRadius: 3,
                                    maxWidth: 420,
                                    background: searchPatients.isRegistered
                                        ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(255,255,255,0.6))'
                                        : 'linear-gradient(135deg, rgba(255,193,7,0.14), rgba(255,255,255,0.6))',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    border: searchPatients.isRegistered
                                        ? '1px solid rgba(34,197,94,0.25)'
                                        : '1px solid rgba(255,193,7,0.25)',
                                    boxShadow: '0 4px 10px rgba(27,94,32,0.25)',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 27,
                                        height: 27,
                                        borderRadius: '50%',
                                        background: searchPatients.isRegistered
                                            ? 'linear-gradient(135deg, #16a34a, #15803d)'
                                            : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 6px 16px rgba(27,94,32,0.35)',
                                    }}
                                >
                                    <Check sx={{ color: '#fff', fontSize: 20 }} />
                                </Box>

                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {searchPatients?.name}
                                    </Typography>

                                    {searchPatients?.isRegistered ? (
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Registered patient
                                        </Typography>
                                        ) : (
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Patient without MedSync account
                                            </Typography>
                                       )}

                                </Box>
                            </Box>


                        )}
                        {hasSearched && !searchPatients && (
                            <Box
                                sx={{
                                    mt: 3,
                                    p: 3,
                                    borderRadius: 3,
                                    mx: 'auto',

                                    background:
                                        'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                                    border: '1px solid rgba(226, 232, 240, 0.8)',
                                    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
                                }}
                            >

                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                    <PersonAddOutlined
                                        sx={{ fontSize: 18, color: '#fbbf24' }}
                                    />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        New patient details
                                    </Typography>
                                </Stack>

                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                    Patient not found in MedSync. Please enter basic details to continue.
                                </Typography>

                                <Grid container spacing={2.1}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            label="First name"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            label="Last name"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            value={cnp}
                                            onChange={(e) => setCnp(e.target.value)}
                                            label="CNP (optional)"
                                            fullWidth
                                            inputProps={{ maxLength: 13 }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            label="Email (optional)"
                                            fullWidth
                                        />
                                    </Grid>

                                </Grid>

                            </Box>
                        )}

                    </Stack>
                )}
                {activeStep === 1 && (
                    <Stack spacing={1.5}>

                        {/* Specialty */}
                        <Stack spacing={0.5}>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#64748b',
                                    fontSize: 11,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.8,
                                    fontWeight: 600
                                }}
                            >
                                Specialty
                            </Typography>

                            <FormControl size="small" fullWidth>
                                <Select
                                        sx={{borderRadius: 2}}
                                        value={selectedSpecialtyId}
                                        onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                                        displayEmpty
                                        renderValue={(value) =>
                                            value === ''
                                                ? 'Select specialty'
                                                : specialtiesWithServices.find(s => s.specialtyId === value)?.specialtyName
                                        }
                                    >

                                    {specialtiesWithServices.map(s => (
                                        <MenuItem key={s.specialtyId} value={s.specialtyId}>
                                            {s.specialtyName}
                                        </MenuItem>
                                    ))}

                                </Select>
                            </FormControl>
                        </Stack>

                        {/* Service */}
                        <Stack spacing={0.5}>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#64748b',
                                    fontSize: 11,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.8,
                                    fontWeight: 600
                                }}
                            >
                                Service
                            </Typography>

                            <FormControl size="small" fullWidth>
                                <Select
                                    sx={{borderRadius: 2}}
                                    value={selectedServiceId}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                        displayEmpty
                                        renderValue={(value) =>
                                            value === ''
                                                ? 'Select service'
                                                : services.find(s => s.id === value)?.name
                                        }
                                >
                                    {services.map(s => (
                                        <MenuItem key={s.id} value={s.id}>
                                            {s.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                    </Stack>
                    )}
                {activeStep === 2 && (
                    <Stack spacing={2}>
                        <Box  sx={{
                            position: "relative",
                            overflow: "visible",
                        }}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{
                                    cursor: "pointer",
                                    width: "fit-content",
                                    mb: 2,
                                }}
                                onClick={() => setShowCalendar(!showCalendar)}
                            >
                                <Typography variant="h6" fontWeight={600}>
                                    {selectedDate.format("dddd, D MMMM")}
                                </Typography>

                                <ExpandMoreIcon
                                    sx={{
                                        transition: "0.2s",
                                        transform: showCalendar ? "rotate(180deg)" : "rotate(0deg)",
                                    }}
                                />
                            </Stack>

                            <Collapse in={showCalendar} timeout="auto">
                                <Box mt={2}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <StaticDatePicker
                                            disablePast
                                            value={selectedDate}
                                            onChange={(newDate) => {
                                                if (newDate) {
                                                    setSelectedDate(newDate);
                                                }
                                            }}
                                            slotProps={{
                                                actionBar: {
                                                    actions: [],
                                                },
                                            }}
                                            displayStaticWrapperAs="desktop"
                                        />
                                    </LocalizationProvider>
                                </Box>
                            </Collapse>
                            {(!doctors || doctors.length === 0) && (
                                <Typography
                                    variant="body2"
                                    sx={{ color: "#94a3b8", mt: 2 }}
                                >
                                    No availability for the selected date.
                                </Typography>
                            )}
                        </Box>
                        <Box
                            sx={{
                                maxHeight: "50vh",
                                overflowY: "auto",
                                pr: 1,
                            }}
                        >
                            {loadingDoctors ? (
                                <CircularProgress className="circular-progress-main-grid"/>
                                ) : (
                        doctors.map((doctor) => (
                            <DoctorAvailabilityCard
                                key={doctor.id}
                                name={doctor.name}
                                specialtyName={selectedSpecialty?.specialtyName}
                                serviceName={selectedService?.name}
                                slots={doctor.slots}
                                selectedSlot={selectedSlot}
                                onClickCallBack={(startTime: string) => setSelectedSlot(
                                    {
                                        doctorId: doctor.id,
                                        startTime: startTime
                                    }
                                )}
                                doctorId={doctor.id}
                            />
                        )))
                            }
                        </Box>


                    </Stack>
                )}

                {activeStep ===  3 &&
                    <>
                    <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <AssignmentOutlinedIcon
                                sx={{ fontSize: 20, color: "primary.main", mr: 1 }}
                            />
                            <Typography variant="subtitle1" fontWeight={600}>
                                Appointment details
                            </Typography>
                        </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                            Date and time
                        </Typography>
                        <Typography sx={{ fontWeight: 600 }}>
                            {DateTimeFormat.appointmentDateFormat(selectedDate)} · {DateTimeFormat.timeFormat(selectedSlot?.startTime)}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid
                            item
                            xs={12}
                            sm={4}
                            sx={{
                                pr: { sm: 4 },
                                borderRight: { sm: '1px solid', xs: 'none' },
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                                Patient
                            </Typography>
                            <Typography sx={{ fontWeight: 600 }}>
                                {searchPatients?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {phoneInput}
                            </Typography>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={4}
                            sx={{
                                px: { sm: 4, xs: 0 },
                                borderRight: { sm: '1px solid', xs: 'none' },
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                                Doctor
                            </Typography>
                            <Typography sx={{ fontWeight: 600 }}>
                                {doctor?.name}
                            </Typography>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={4}
                            sx={{
                                pl: { sm: 4, xs: 0 },
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                                Service
                            </Typography>
                            <Typography sx={{ fontWeight: 600 }}>
                                {selectedSpecialty?.specialtyName} - {selectedService?.name}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">
                            Total cost
                        </Typography>
                        <Typography sx={{ fontWeight: 600 }}>
                            {selectedService?.price}
                        </Typography>
                    </Box>
                </Box>
                        <FormControlLabel
                            control={<Checkbox
                                checked={hasReferral}
                                onChange={(e) => setHasReferral(e.target.checked)}
                            />}
                            label={"Appointment with referral"}
                        />
                    {hasReferral &&
                        <TextField
                            sx={{width:247}}
                            fullWidth
                            size="small"
                            label={"Enter referral code"}
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value)}
                        ></TextField>
                    }
                    </>
                }

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    {activeStep > 0 ? (
                        <Button
                            onClick={handleBack}
                            disabled={activeStep === 0}
                            sx={{
                                textTransform: "none",
                                fontSize: 13,
                            }}
                        >
                            Back
                        </Button>
                    ) :  (
                        <div/>
                    )}


                    <Button
                        onClick={() => {
                            if(activeStep === 3)
                                addAppointment();
                            else
                                setActiveStep(activeStep + 1)
                        }}
                        disabled={
                            (activeStep === 0 && (phoneInput.length !== 10 && phoneInput.length != 13 || (!searchPatients && (!firstName || !lastName)))) ||
                            (activeStep === 1 && (!selectedSpecialtyId || !selectedServiceId)) ||
                            (activeStep === 2 && !selectedSlot) ||
                            (activeStep === 3 && hasReferral && referralCode.trim().length < 4)
                        }
                        sx={{
                            px: 3,
                            py: 0.8,
                            borderRadius: 1.5,
                            textTransform: "none",
                            fontSize: 13,
                            fontWeight: 500,
                            bgcolor: "#5B9FD8",
                            color: "white",
                            "&:hover": {
                                bgcolor: "#4A8BC2",
                            },

                            '&:disabled': {
                                bgcolor: '#E5EDF5',
                                color: '#94a3b8',
                            },
                        }}
                    >
                        {activeStep !== 3 ? "Continue" : "Create"}
                    </Button>
                </Box>

            </Stack>
        </Box>
    );
}