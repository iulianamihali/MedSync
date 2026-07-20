import CloseIcon from '@mui/icons-material/Close';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import UpdateIcon from '@mui/icons-material/Update';
import DoneAllIcon from '@mui/icons-material/DoneAll';

enum AppointmentStatusEnumType {
    Canceled = 0,
    Missed = 1,
    Confirmed = 2,
    InProgress = 3,
    Rescheduled = 4,
    Completed = 5,
}

export const appointmentStatusValues = [
    {
        id: AppointmentStatusEnumType.Canceled,
        text: "Canceled",
        style: {
            bg: "#FDECEA",
            color: "#B71C1C"
        },
        icon: CloseIcon,
    },
    {
        id: AppointmentStatusEnumType.Missed,
        text: "Missed",
        style: { bg: "#FFEBEE", color: "#C62828" },
        icon: EventBusyIcon,
    },
    {
        id: AppointmentStatusEnumType.Confirmed,
        text: "Confirmed",
        style: { bg: "#E3F2FD", color: "#1976D2" },
        icon: CheckCircleIcon,
    },
    {
        id: AppointmentStatusEnumType.InProgress,
        text: "In progress",
        style: { bg: "#FFF3E0", color: "#EF6C00" },
        icon: PlayCircleIcon,
    },
    {
        id: AppointmentStatusEnumType.Rescheduled,
        text: "Rescheduled",
        style: { bg: "#F3E8FF", color: "#7C3AED" },
        icon: UpdateIcon,
    },
    {
        id: AppointmentStatusEnumType.Completed,
        text: "Completed",
        style: { bg: "#E8F5E9", color: "#2E7D32" },
        icon: DoneAllIcon
    }
]

export const appointmentStatusTransitions: Record<
    AppointmentStatusEnumType,
    AppointmentStatusEnumType[]
> = {
    [AppointmentStatusEnumType.Confirmed]: [
        AppointmentStatusEnumType.InProgress,
        AppointmentStatusEnumType.Canceled,
    ],

    [AppointmentStatusEnumType.InProgress]: [
        AppointmentStatusEnumType.Completed,
    ],

    [AppointmentStatusEnumType.Rescheduled]: [
        AppointmentStatusEnumType.Confirmed,
    ],

    [AppointmentStatusEnumType.Completed]: [],
    [AppointmentStatusEnumType.Canceled]: [],
    [AppointmentStatusEnumType.Missed]: [],
};

export default AppointmentStatusEnumType;