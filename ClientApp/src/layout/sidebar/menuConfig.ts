import UserEnumType from "../../enums/UserEnumType.ts";
import type {IconType} from "../../icons/iconRegistry.ts";

interface MenuItem {
    label: string;
    path: string;
    roles: UserEnumType[];
    icon?: IconType;
}

const menuConfig: MenuItem[] = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: "dashboard",
        roles: [UserEnumType.GlobalAdmin, UserEnumType.LocalAdmin, UserEnumType.Doctor, UserEnumType.Patient]
    },
    {
        label: "Map",
        path: "/map",
        icon: "map",
        roles: [UserEnumType.Patient]
    },
    {
        label: "Appointments",
        path: "/appointments",
        icon: "appointments",
        roles: [UserEnumType.LocalAdmin, UserEnumType.Doctor]
    },
    {
        label: "Medical History",
        path: "/medical-history",
        icon: "medicalHistory",
        roles: [UserEnumType.Patient]
    },
    {
        label: "Institutions",
        path: "/institutions",
        icon: "institutions",
        roles: [UserEnumType.GlobalAdmin]
    },
    {
        label: "Users",
        path: "/users",
        icon: "users",
        roles: [UserEnumType.GlobalAdmin]
    },
    {
        label: "Patients",
        path: "/patients",
        icon: "patients",
        roles: [UserEnumType.LocalAdmin, UserEnumType.Doctor]
    },
    {
        label: "Feedback",
        path: "/feedback",
        icon: "feedback",
        roles: [UserEnumType.Doctor]
    },
    {
        label: "Doctors",
        path: "/doctors",
        icon: "doctors",
        roles: [UserEnumType.LocalAdmin]
    },

    {
        label: "Services",
        path: "/services",
        icon: "services",
        roles: [UserEnumType.LocalAdmin, UserEnumType.Doctor]
    },
    {
        label: "Caregiving",
        path: "/careGiving",
        icon: "careGiving",
        roles: [UserEnumType.Patient]
    },
    {
        label: "Support",
        path: "/support",
        icon: "issue",
        roles: [UserEnumType.GlobalAdmin]
    },
    {
        label: "Settings",
        path: "/settings",
        icon: "settings",
        roles: [UserEnumType.GlobalAdmin, UserEnumType.LocalAdmin, UserEnumType.Doctor, UserEnumType.Patient]
    },


]
export default menuConfig;