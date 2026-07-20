import useAuth from "../../store/features/auth/authHook";
import DashboardAdminGlobal from "./dashboardAdminGlobal/DashboardAdminGlobal";
import DashboardAdminLocal from "./dashboardAdminLocal/DashboardAdminLocal";
import UserEnumType from "../../enums/UserEnumType";
import {DashboardDoctor} from "./dashboardDoctor/DashboardDoctor";
import DashboardPatient from "./dashboardPatient/DashboardPatient";
// import DashboardDoctor from "./dashboardDoctor/DashboardDoctor";
// import DashboardPatient from "./dashboardPatient/DashboardPatient";

const DashboardRoleRouter = () => {
    const role = useAuth()?.user?.role;

    switch (role) {
        case UserEnumType[UserEnumType.GlobalAdmin]:
            return <DashboardAdminGlobal />;

        case UserEnumType[UserEnumType.LocalAdmin]:
            return <DashboardAdminLocal />;

        case UserEnumType[UserEnumType.Doctor]:
            return <DashboardDoctor />;
        case UserEnumType[UserEnumType.Patient]:
            return <DashboardPatient />;


        // case "Doctor":
        //     return <DashboardDoctor />;
        //
        // case "Patient":
        //     return <DashboardPatient />;
        //


        default:
            return <div>Unauthorized</div>;
    }
};

export default DashboardRoleRouter;
