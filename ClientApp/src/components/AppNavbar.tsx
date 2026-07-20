import {styled} from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MuiToolbar from '@mui/material/Toolbar';
import {tabsClasses} from '@mui/material/Tabs';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DropDownFilter from "./DropDownFilter";
import { useLocation } from 'react-router-dom';
import DropDownUserFilter from "./DropDownUserFilter";
import useAuth from "../store/features/auth/authHook";
import {useEffect, useState} from "react";
import axiosUtil from "../common/axiosUtil";
import GlobalSettings from "../GlobalSettings.json";
import { Typography } from "@mui/material";
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const Toolbar = styled(MuiToolbar)({
    width: '100%',
    padding: '0 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    justifyContent: 'center',
    minHeight: '50px !important',
    gap: '12px',
    flexShrink: 0,
    [`& ${tabsClasses.flexContainer}`]: {
        gap: '8px',
        p: '8px',
        pb: 0,
    },
});

export default function AppNavbar({ onMenuClick, isDrawerOpen }: { onMenuClick?: () => void; isDrawerOpen?: boolean }) {
    const location = useLocation();
    const auth = useAuth();
    const [institutionName, setInstitutionName] = useState<string | null>(null);

    useEffect(() => {
        if (!auth.user) return;
        if (auth.user.role !== "Doctor" && auth.user.role !== "LocalAdmin") return;
        if (!auth.user.ins) return;

        const url = `${GlobalSettings.institutionRoute}/getInstitutionName/${auth.user.ins}`;

        axiosUtil.get(url)
            .then(res => {
                setInstitutionName(res.data);
            })
            .catch(err => {
                console.error(err);
            });

    }, [auth.user]);

    return (
        <AppBar
            position="fixed"
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                boxShadow: 0,
                bgcolor: '#d3e5f6',
                // backgroundImage: "linear-gradient(180deg, rgba(74,144,226,0.25) 0%, rgba(125,225,154,0.25) 100%)",
                borderBottom: '1px solid',
                borderColor: 'divider',
                height: 50,
            }}
        >
            <Toolbar variant="regular">
                <Stack
                    direction="row"
                    sx={{

                        width: '100%',
                        gap: 1,
                        // maxHeight: 30
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ justifyContent: 'space-between', flex: '1 1' }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ minWidth: 0 }}
                        >
                            {onMenuClick && (
                                <IconButton
                                    onClick={onMenuClick}
                                    sx={{
                                        display: { xs: 'flex', md: 'none' },
                                        ml: -1,
                                        flexShrink: 0,
                                    }}
                                >
                                    {isDrawerOpen ? <CloseIcon /> : <MenuOutlinedIcon />}
                                </IconButton>
                            )}

                            <Box
                                sx={{
                                    display: { xs: 'none', sm: 'flex' },
                                    paddingTop: '12px',
                                    alignItems: 'center',
                                }}
                            >
                                <img
                                    src="/assets/logo-modified.png"
                                    style={{ width: 'auto', height: 92 }}
                                />
                            </Box>

                            {institutionName && (
                                <Box
                                    sx={{
                                        ml: { xs: 0, sm: 2 },
                                        px: 1.25,
                                        py: 0.5,
                                        borderRadius: 1,
                                        backgroundColor: 'rgba(255,255,255,0.45)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        minWidth: 0,
                                    }}
                                >
                                    <LocalHospitalOutlinedIcon
                                        sx={{
                                            fontSize: 16,
                                            color: 'rgba(0,0,0,0.55)',
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 400,
                                            color: 'rgba(0,0,0,0.8)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: { xs: 120, sm: 'none' },
                                        }}
                                    >
                                        {institutionName}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>

                        <Box sx={{
                            minWidth: { xs: 120, sm: 190 },
                            flexGrow: 0,
                            flexShrink: 0,
                        }}>
                            {location.pathname.includes("dashboard") && <DropDownFilter />}
                            {location.pathname.includes("users") && <DropDownUserFilter />}
                        </Box>
                    </Stack>
                </Stack>
            </Toolbar >
        </AppBar>
    );
}

export function CustomIcon() {
    return (
        <Box
            sx={{
                width: '1.5rem',
                height: '1.5rem',
                bgcolor: 'black',
                borderRadius: '999px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                backgroundImage:
                    'linear-gradient(135deg, hsl(210, 98%, 60%) 0%, hsl(210, 100%, 35%) 100%)',
                color: 'hsla(210, 100%, 95%, 0.9)',
                border: '1px solid',
                borderColor: 'hsl(210, 100%, 55%)',
                boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.3)',
            }}
        >
            <DashboardRoundedIcon color="inherit" sx={{ fontSize: '1rem' }} />
        </Box>
    );
}