// AppointmentCardAI.tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import type {CalendarAppointmentsByDoctorDto} from "../pages/appointments/types";

type Props = {
    appointments: CalendarAppointmentsByDoctorDto[];
};

export default function AppointmentCardAI({ appointments }: Props) {
    const formatTime = (d: string) =>
        new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            {appointments.map((app) => (
                <Box key={app.id} sx={{
                    background: 'white',
                    border: '0.5px solid #e2e8f0',
                    borderRadius: '10px',
                    borderLeft: '3px solid #E8833A',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PersonIcon sx={{ fontSize: 14, color: '#E8833A' }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                            {app.patientName}
                        </Typography>
                    </Box>

                    <Typography sx={{ fontSize: 10, color: '#64748b' }}>
                        {app.service}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AccessTimeIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                        <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>
                            {formatTime(app.startDateTimeUtc)} - {formatTime(app.endDateTimeUtc)} · {app.duration} min
                        </Typography>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}