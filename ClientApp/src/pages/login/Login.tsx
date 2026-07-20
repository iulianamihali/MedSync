import './Login.scss';
import FormLogin from "./formLogin/FormLogin.tsx";
import {Navigate} from "react-router-dom";
import useAuth from "../../store/features/auth/authHook";
export default function Login () {
    const auth = useAuth();
    if(auth.isAuthenticated)
        return <Navigate to="/" />;
    return (
        <>
            <div className="login-page">
                <div className="logo-container">
                    <img src="/assets/logo.png" className="logo"/>
                </div>
                <FormLogin />
            </div>
        </>

    );

}