import {
    Box,
    Typography,
    Stack,
    alpha,
    Divider, FormControl, InputLabel, MenuItem
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from '@mui/icons-material/Payment';
import type { CalendarAppointmentsDto } from "./types";
import DateTimeFormat from "../../../../../common/dateTimeUtil";
import Select from "@mui/material/Select";
import AppointmentStatusEnumType, {
    appointmentStatusTransitions,
    appointmentStatusValues
} from "../../../../../enums/AppointmentStatusEnumType";
import {TextField} from "@mui/material";
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';

type Props = {
    appointment: CalendarAppointmentsDto;
    setAppointment: (appointment: CalendarAppointmentsDto) => void;
};

export default function AppointmentsView({ appointment, setAppointment }: Props) {
    const statusItem = appointmentStatusValues.find(
        x => x.id === appointment.status
    );

    const allowedStatuses =
        appointmentStatusTransitions[appointment.status] ?? [];
    const getIcon = () => {
        const item = appointmentStatusValues.find(x => x.id === appointment.status);
        return (
            <span>{item?.icon && <item.icon fontSize="small" className="icon-status"  sx={{ color: item?.style?.color }}/>}</span>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
                {/* Service Card */}
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: (theme) => alpha('#fa6b6b', 0.08),
                        borderLeft: '3px solid #fa6b6b'
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <MedicalServicesIcon sx={{ fontSize: 20, color: '#fa6b6b' }} />
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
                            Service
                        </Typography>
                    </Stack>
                    <Typography fontWeight={700} fontSize={17} sx={{ color: '#0f172a' }}>
                        {appointment.service}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                        <LocalHospitalIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography fontSize={14} sx={{ color: '#64748b' }}>
                            {appointment.specialty}
                        </Typography>
                    </Stack>
                </Box>

                <Divider />

                {/* Doctor & Patient */}
                <Stack direction="row" spacing={3}>
                    <Box flex={1}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <BadgeIcon sx={{ fontSize: 18, color: '#81b0f6' }} />
                            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }}>
                                Doctor
                            </Typography>
                        </Stack>
                        <Typography fontWeight={600} fontSize={15} sx={{ color: '#111827' }}>
                            Dr. {appointment.doctorName}
                        </Typography>
                    </Box>

                    <Box flex={1}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <PersonIcon sx={{ fontSize: 18, color: '#d2a99b' }} />
                            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }}>
                                Patient
                            </Typography>
                        </Stack>
                        <Typography fontWeight={600} fontSize={15} sx={{ color: '#111827' }}>
                            {appointment.patientName}
                        </Typography>
                    </Box>
                </Stack>

                <Divider />

                {/* Time */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <AccessTimeIcon sx={{ fontSize: 18, color: '#64748b' }} />
                    <Typography fontWeight={600} fontSize={15} sx={{ color: '#334155' }}>
                        {DateTimeFormat.timeFormat(appointment.startDateTimeUtc)} – {DateTimeFormat.timeFormat(appointment.endDateTimeUtc)}
                    </Typography>
                </Stack>

                {/* Price */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <PaymentIcon sx={{ fontSize: 18, color: '#10b981' }} />
                    <TextField
                        disabled
                        type="number"
                        label="Standard Price"
                        required
                        value={appointment.standardPrice}
                        name="Price"
                        size="small"
                        sx={{mt: 1.4,  "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                            },}}
                    />

                    <Typography fontWeight={600} fontSize={15} sx={{ color: '#065f46' }}>
                        {appointment.duration} min
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <SummarizeOutlinedIcon sx={{ fontSize: 18, color: '#4b408a' }} />
                    <TextField
                        type="number"
                        label="Total Price"
                        required
                        value={appointment.totalPrice}
                        onChange={(e) => setAppointment({...appointment, totalPrice: e.target.value})}
                        name="Price"
                        size="small"
                        sx={{mt: 1.4,  "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                            }
                        }}
                    />

                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <div style={{marginTop: 22}}>
                        {getIcon()}
                    </div>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 500,
                            }}
                        >
                            Status
                        </Typography>
                        <Select
                            disabled={appointment?.status === AppointmentStatusEnumType.Completed || appointment?.status === AppointmentStatusEnumType.Canceled || appointment?.status === AppointmentStatusEnumType.Missed}
                            value={appointment.status}
                            renderValue={() => statusItem?.text ?? ''}
                            onChange={(e) => setAppointment({...appointment, status: e.target.value})}
                            sx={{
                                color: statusItem?.style.color,
                                borderRadius: 2
                            }}
                        >
                            {appointmentStatusValues
                                .filter(s => allowedStatuses.includes(s.id))
                                .map(s => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.text}
                                    </MenuItem>
                                ))}

                        </Select>
                    </FormControl>
                </Stack>
            </Stack>
        </Box>
    );
}