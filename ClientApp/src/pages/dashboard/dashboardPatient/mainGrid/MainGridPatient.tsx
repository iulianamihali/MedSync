import Box from "@mui/material/Box";
import MuiToolbar from "@mui/material/Toolbar";
import {Typography} from "@mui/material";
import Grid from "@mui/material/Grid";
import MapPreview from "./mapPreview/MapPreview";
import FutureAppointments from "./futureApp/FutureAppointments";
import useAuth from "../../../../store/features/auth/authHook";
import MyFavoriteDoctors from "./activeMedication/ActiveMedications";
import ActiveMedications from "./activeMedication/ActiveMedications";

export default function MainGridPatient()
{
    const firstName = useAuth()?.user?.name.split(" ")[0];

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }}}>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    mb: 3,
                }}
            >
                <MuiToolbar disableGutters/>
                <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                        color: 'text.primary',
                        fontWeight: 500,
                        fontSize: 24,
                        mt: 3
                    }}
                >
                    <Typography
                        variant="h6"
                        component="h1"
                        sx={{
                            color: 'text.primary',
                            fontWeight: 500,
                            fontSize: 24,
                            mt: 3
                        }}
                    >
                        Welcome back, {firstName}!
                    </Typography>
                </Typography>
            </Box>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md:6}}>
                    <MapPreview />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <ActiveMedications />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <FutureAppointments />
                </Grid>
            </Grid>

        </Box>
    );
}