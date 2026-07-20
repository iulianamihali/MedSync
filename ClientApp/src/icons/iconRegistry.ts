import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import MapIcon from '@mui/icons-material/Map';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export const iconRegistry = {
    dashboard: DashboardIcon,
    institutions: BusinessIcon,
    users: GroupOutlinedIcon,
    patients: Groups2OutlinedIcon,
    map: MapIcon,
    doctors: BadgeOutlinedIcon,
    feedback: RateReviewOutlinedIcon,
    services: MedicalServicesIcon,
    settings: SettingsIcon,
    appointments: CalendarMonthOutlinedIcon,
    myPatients: AssignmentIndOutlinedIcon,
    history: HistoryOutlinedIcon,
    profile: AccountCircleOutlinedIcon,
    medicalHistory: HistoryOutlinedIcon,
    careGiving: Groups2OutlinedIcon,
    issue: HelpOutlineIcon,
}

export type IconType = keyof typeof iconRegistry;
