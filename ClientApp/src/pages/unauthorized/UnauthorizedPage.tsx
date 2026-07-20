import { Box, Container, Typography, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
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
                        <LockOutlinedIcon sx={{ fontSize: 40, color: '#d32f2f' }} />
                    </Box>

                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: '6rem',
                            fontWeight: 700,
                            color: '#212121',
                            mb: 1,
                            lineHeight: 1,
                        }}
                    >
                        403
                    </Typography>

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: '#212121',
                            mb: 2,
                        }}
                    >
                        Unauthorized Access
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
                        You do not have permission to view this page. Please contact your system administrator.
                    </Typography>

                    {/* Button */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/')}
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
                        Return to Home
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default UnauthorizedPage;