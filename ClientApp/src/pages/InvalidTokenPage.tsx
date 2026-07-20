import { Box, Container, Typography, Button } from '@mui/material';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import { useNavigate } from 'react-router-dom';

const InvalidTokenPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fafafa',
            }}
        >
            <Container maxWidth="sm">
                <Box sx={{ textAlign: 'center' }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: '#ffebee',
                            mb: 3,
                        }}
                    >
                        <LockClockOutlinedIcon sx={{ fontSize: 40, color: '#d32f2f' }} />
                    </Box>

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: '#212121',
                            mb: 2,
                        }}
                    >
                        Invalid or Expired Link
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: '#757575',
                            mb: 4,
                            maxWidth: 400,
                            mx: 'auto',
                        }}
                    >
                        This password reset link is invalid or has expired. Please request a new one.
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{
                            bgcolor: '#4A90E2',
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 4,
                            py: 1.5,
                            borderRadius: 7,
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#1565c0',
                                boxShadow: 'none',
                            },
                        }}
                    >
                        Back to Login
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default InvalidTokenPage;