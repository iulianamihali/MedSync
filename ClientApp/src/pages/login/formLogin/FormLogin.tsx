import './FormLogin.scss';
import {TextField, InputAdornment, IconButton, Typography, Button, Link, Box} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import {useState} from "react";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type {LoginRequestDto} from "../../../dtos/auth/LoginRequestDto.ts";
import axiosUtil from "../../../common/axiosUtil.ts";
import {useNavigate} from "react-router-dom";
import {useAppDispatch} from "../../../store/hook";
import {login} from "../../../store/features/auth/authSlice";
import LoginEntity from "../../../models/LoginEntity";
import CustomPopUp from "../../../components/CustomPopUp";
import GlobalSettings from "../../../GlobalSettings.json";
import { Snackbar, Alert } from '@mui/material';

export default function FormLogin () {
    const dispatch = useAppDispatch();
    const [formLogin, setFormLogin] = useState(new LoginEntity());
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const isFormValid =
        formLogin.email &&
        formLogin.password;
    const[resetPassword, setResetPassword] = useState<boolean>(false);
    const[emailForResetPassword, setEmailForResetPassword] = useState<string>("");
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const loginData: LoginRequestDto = {
                email: formLogin.email,
                password: formLogin.password,
            };
            const response = await axiosUtil.post("/auth/login", loginData);
            const token = response.data;
            if (token) {
                dispatch(login(token));
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("login failed:", error);
            alert("Email or password wrong!");
        }
    }

    const sendEmailForResetPassword = () => {
        const url = `${GlobalSettings.auth}/request-reset-password`;
        axiosUtil.post(url,
            JSON.stringify(emailForResetPassword),
            {
            headers: { 'Content-Type': 'application/json' }
        })
            .then((response) => {
                if (response.data === true) {
                    setSnackbar({
                        open: true,
                        message: 'Reset link sent! Please check your email.',
                        severity: 'success'
                    });
                    setResetPassword(false);
                } else {
                    setSnackbar({
                        open: true,
                        message: 'Email not found in our system.',
                        severity: 'error'
                    });
                }
            })
            .catch(err => {
                console.error("Error sending email:", err);
            });
    }

    return (
        <>
            <div className="form-login-container">
                <Typography variant="h6" gutterBottom noWrap >
                    Welcome back to MedSync
                </Typography>

                <form onSubmit={handleLogin}>

                    <TextField
                        sx={{ mt: 1.4,  "& .MuiOutlinedInput-root": {
                                borderRadius: "12px", marginBottom: "13px",
                            },
                            "& .MuiFormLabel-asterisk": {
                                color: "red",
                            },}}
                        id="input-with-icon-textfield"
                        label="Email"
                        name="email"
                        type="email"
                        value={formLogin.email}
                        onChange={(e) =>
                            setFormLogin({...formLogin, email: e.target.value})
                        }
                        size="small"
                        required
                        fullWidth
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle sx={{ color: "#4A90E2"}}/>
                                    </InputAdornment>
                                ),
                            } as never,
                        }}
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formLogin.password}
                        onChange={(e) =>
                            setFormLogin({...formLogin, password: e.target.value})
                        }
                        size="small"
                        required
                        fullWidth
                        sx={{ my: 1.4,  "& .MuiOutlinedInput-root": {
                                borderRadius: "12px"
                            },
                            "& .MuiFormLabel-asterisk": {
                                color: "red",
                            },}}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            size="small"
                                            sx={{ color: "#4A90E2" }}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            } as never,
                        }}
                    />

                    <Box
                        onClick={() => setResetPassword(true)}
                        className="forgot-password-row">
                        <Link
                            component="button"
                            type="button"
                            className="forgot-password-link"
                        >
                            Forgot your password?
                        </Link>
                    </Box>

                    <Button
                        disabled = {!isFormValid}
                        type="submit"
                        variant="outlined"
                        color="info"
                        size="small"
                        disableElevation
                        fullWidth
                        sx={{ my: 2,
                            "&.Mui-disabled": {
                                background: "linear-gradient(to right, #4facfe, #43e97b)",
                                opacity: 0.5,
                                color: "#fff",
                            },}}
                        className="button-login"

                    >
                        Log In
                    </Button>
                    <Typography variant="body2" sx={{ textAlign: 'center', mt: 0.23, fontSize: "0.9rem", color: 'text.secondary' }}>
                        New to MedSync? <Link sx={{fontWeight: 800}} href="/signup">Create account</Link>
                    </Typography>

                </form>

                <CustomPopUp
                    open={resetPassword}
                    setOpen={setResetPassword}
                    title={"Reset your password"}
                    contentComponent={() => (
                        <>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Please enter your email address and we'll send you a link to reset your password.
                            </Typography>
                            <TextField
                                autoFocus
                                value={emailForResetPassword}
                                onChange={(e) => setEmailForResetPassword(e.target.value)}
                                label="Enter your email"
                                type="email"
                                fullWidth
                                size="small"
                            />
                        </>
                    )}
                    showActions={true}
                    textButton={"Reset"}
                    width={"50%"}
                    onClickCallback={sendEmailForResetPassword}
                    />
            </div>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );

    
}