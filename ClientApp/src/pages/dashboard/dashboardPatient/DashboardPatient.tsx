import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import MainGridPatient from "./mainGrid/MainGridPatient";

export default function DashboardPatient ()
{
    return (
        <>
            <CssBaseline enableColorScheme />
            <Box sx={{ display: 'flex' }}>
                {/* Main content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        bgcolor: 'background.default',
                        overflow: 'auto',
                    }}
                >
                    <Stack
                        spacing={2}
                        sx={{
                            alignItems: 'center',
                            mx: 3,
                            pb: 5,
                            mt: { xs: 6, md: 4},
                        }}
                    >
                        <MainGridPatient />
                    </Stack>
                </Box>
            </Box>
        </>
    );
}