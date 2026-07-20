import UserEnumType from "../enums/UserEnumType";
import type {JSX} from "react";
import {Navigate, useLocation} from "react-router-dom";
import useAuth from "../store/features/auth/authHook";
import verifyRole from "../utils/verifyRole";

export type Props = {
    allowedRoles: UserEnumType[];
    children: JSX.Element;
}
export default function ProtectedRoute(props: Props) {
    const auth = useAuth();
    const location = useLocation();
    if (!auth.isAuthenticated) {
        return <Navigate to="/landing-page" state={{ from: location }} replace />;
    }

    if (!props.allowedRoles.some(x => verifyRole(x, auth?.user?.role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return props.children;
}