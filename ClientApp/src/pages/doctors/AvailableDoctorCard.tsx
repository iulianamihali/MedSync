import {Box, Stack, Typography, Button, Avatar} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import DateTimeFormat from "../../common/dateTimeUtil";
import type { CheckAvailabilityDoctorsResponse } from "../appointments/types";
import {useState} from "react";
import AppointmentSummaryDialog from "../appointments/AppointmentSummaryDialog";
import type {Dayjs} from "dayjs";
import type {Specialty} from "../signUp/formSignUp/FormSignUp";
import type {Service} from "../dashboard/dashboardAdminLocal/mainGridLocal/appointmentsView/CreateAppointmentView";
import type {BookingFor} from "../careGiving/CareGiving";

type Props = {
    availableDoctor: CheckAvailabilityDoctorsResponse | null;
    selectedDate: Dayjs | null;
    specialty: Specialty;
    service: Service
    institutionId: string;
    onConfirmed? :() => void;
    bookingFor?: BookingFor;
};

export default function AvailableDoctorCard(props: Props) {
    const [viewAllAvailableSlots, setViewAllAvailableSlots] = useState<boolean>(false);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [openDialog, setOpenDialog] = useState<boolean>(false);

    return (

                <Box sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    p: 2.5,
                    maxWidth: 320,
                    backgroundColor: 'white',
                }}>

                    <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: '#f0f0f0' }} />

                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight="600" lineHeight={1.2}>
                                Dr. {props.availableDoctor?.name}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 0.5 }}>
                                {props.availableDoctor?.doctorSpecialties.map(s => s.name).join(" • ")}
                            </Typography>

                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <StarIcon sx={{ color: '#FFC107', fontSize: 16 }} />
                                <Typography variant="body2" fontWeight="500">
                                    {props.availableDoctor?.rating}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ({props.availableDoctor?.totalReviews} reviews)
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                        AVAILABLE SLOTS
                    </Typography>

                    {props.availableDoctor?.slotsAvailable.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" align="center" mb={2}>
                            No available slots
                        </Typography>
                    ) : (
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 1,
                            mb: 2
                        }}>
                            {(viewAllAvailableSlots
                               ? props.availableDoctor?.slotsAvailable
                                : props.availableDoctor?.slotsAvailable?.slice(0,6)
                            )?.map((slot, index)  => (
                                <Button
                                    onClick={() => {
                                        setOpenDialog(true);
                                        setSelectedTime(slot.start)}}
                                    key={index}
                                    disableElevation
                                    sx={{
                                        backgroundColor: '#f8f9fa',
                                        color: '#1a1a1a',
                                        fontWeight: '500',
                                        borderRadius: '8px',
                                        py: 1,
                                        '&:hover': { background: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)", borderColor: 'transparent' }
                                    }}
                                >
                                    {DateTimeFormat.timeFormat(slot.start)}
                                </Button>
                            ))}
                        </Box>
                    )}

                    {!viewAllAvailableSlots && props.availableDoctor && props.availableDoctor?.slotsAvailable.length > 6
                        ?
                    <Button
                        onClick={() => setViewAllAvailableSlots(true)}
                        fullWidth
                        disableElevation
                        sx={{
                            backgroundColor: '#f8f9fa',
                            color: '#1a1a1a',
                            textTransform: 'none',
                            fontWeight: '500',
                            borderRadius: '8px',
                            py: 1.5,
                            '&:hover': { backgroundColor: '#e9ecef' }
                        }}
                    >
                        View all available slots
                    </Button>
                : ""}

                    {selectedTime && (
                        <AppointmentSummaryDialog
                            open={openDialog}
                            setOpen={setOpenDialog}
                            selectedDate={props?.selectedDate}
                            startTime={selectedTime}
                            specialty={props.specialty}
                            service={props.service}
                            rating={props.availableDoctor?.rating ?? 0}
                            totalReviews={props.availableDoctor?.totalReviews ?? 0}
                            doctorName={props?.availableDoctor?.name || ""}
                            doctorId={props?.availableDoctor?.id || ""}
                            institutionId={props?.institutionId}
                            onConfirmed={props?.onConfirmed}
                            onClose={() => setSelectedTime("")}
                            bookingFor={props.bookingFor}
                        />
                    )}
                </Box>
    );
}