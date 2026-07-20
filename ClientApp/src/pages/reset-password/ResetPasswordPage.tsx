import React, {useEffect, useState} from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Typography,
    Box,
    IconButton,
    InputAdornment,
    Container
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import './ResetPasswordPage.scss';
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import InvalidTokenPage from "../InvalidTokenPage";
import LockClockOutlinedIcon from "@mui/icons-material/LockClockOutlined";
import CircularProgress from "@mui/material/CircularProgress";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const[valideToken, setValideToken] = useState<boolean | null>(null);
    const isFormValid = password && confirmPassword && password === confirmPassword;

    useEffect(() => {
        if (!token) return;
        const url = `${GlobalSettings.auth}/validate-token-reset?token=${token}`;
        setLoading(true);
        axiosUtil.get<boolean>(url)
            .then(res => {
                setValideToken(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [token]);

    const handleSubmit = (e: React.FormEvent) => {
        const url = `${GlobalSettings.auth}/reset-password`;
        e.preventDefault();

        if (password !== confirmPassword) {
            setSnackbar({
                open: true,
                message: 'Passwords do not match',
                severity: 'error'
            });
            return;
        }

        setLoading(true);
        axiosUtil.post(url, {
            token: token,
            password: password
        })
            .then(() => {
                setSnackbar({
                    open: true,
                    message: 'Password reset successful! Redirecting to login...',
                    severity: 'success'
                });
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            })
            .catch((error) => {
                setSnackbar({
                    open: true,
                    message: error.response?.data?.message || 'Failed to reset password',
                    severity: 'error'
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if(loading && valideToken === null)
    {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }
    if(valideToken === false)
        return <InvalidTokenPage />;

    return (
        <>
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#fafafa',
                }}
            >
                <Container maxWidth="xs">
                    <Box sx={{ textAlign: 'center' }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: '#e3f0fd',
                                mb: 3,
                            }}
                        >
                            <LockClockOutlinedIcon sx={{ fontSize: 40, color: '#4A90E2' }} />
                        </Box>


                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, color: '#212121', mb: 1 }}
                        >
                            Create new password
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: '#757575', mb: 4 }}
                        >
                            Please enter your new password below.
                        </Typography>


                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                        >
                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                label="New password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                size="medium"
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                fullWidth
                                type={showConfirmPassword ? 'text' : 'password'}
                                label="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                size="medium"
                                error={!!confirmPassword && password !== confirmPassword}
                                helperText={
                                    confirmPassword && password !== confirmPassword
                                        ? 'Passwords do not match'
                                        : ''
                                }
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={!isFormValid || loading}
                                sx={{
                                    bgcolor: '#4A90E2',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    py: 1.5,
                                    borderRadius: 7,
                                    boxShadow: 'none',
                                    mt: 1,
                                    '&:hover': { bgcolor: '#1565c0', boxShadow: 'none' },
                                    '&.Mui-disabled': { bgcolor: '#b0c9f0', color: '#fff' },
                                }}
                            >
                                {loading ? 'Resetting...' : 'Reset password'}
                            </Button>

                            <Button
                                fullWidth
                                variant="text"
                                onClick={() => navigate('/login')}
                                sx={{
                                    textTransform: 'none',
                                    color: '#757575',
                                    fontWeight: 400,
                                    '&:hover': { bgcolor: 'transparent', color: '#212121' },
                                }}
                            >
                                Back to login
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
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