import './Signup.scss';
import FormSignUp from "./formSignUp/FormSignUp.tsx";
import useAuth from "../../store/features/auth/authHook";
import {Navigate} from "react-router-dom";
export default function SignUp () {
    const auth = useAuth();
    if(auth.isAuthenticated)
        return <Navigate to="/" />;
    return (
        <>
            <div className="signup-page">
                <div className="logo-container">
                    <img src="/assets/logo.png" className="logo"/>
                </div>
                <FormSignUp />
            </div>
        </>
    );
}