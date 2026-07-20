import './/Sidebar.scss';
import React, {useState} from 'react';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import IconButton from '@mui/material/IconButton';
import {Box, Divider, Drawer, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import {NavLink, useNavigate} from "react-router-dom";
import menuConfig from "./menuConfig.ts";
import {iconRegistry} from "../../icons/iconRegistry.ts";
import {useAppDispatch} from "../../store/hook";
import {logout} from "../../store/features/auth/authSlice";
import useAuth from "../../store/features/auth/authHook";
import verifyRole from "../../utils/verifyRole";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CustomPopUp from "../../components/CustomPopUp";
import SupportIssueForm from "../../pages/supportIssues/supportForm/SupportIssueForm";
import UserEnumType from "../../enums/UserEnumType";

type SidebarProps = {
    isSidebarExpanded: boolean;
    setIsSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    isSmallScreen: boolean;
    isDrawerOpen: boolean;
    setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar: React.FC<SidebarProps> = (props: SidebarProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const currentRole = useAuth().user?.role;
    const [openSupportDialog, setOpenSupportDialog] = useState<boolean>(false);

    const handleLogout = () => {
        // Clear authentication tokens and redirect to login
        dispatch(logout());
        localStorage.clear();
        navigate('/login');
    };

    const visibleMenuItems = currentRole
        ? menuConfig.filter(item => item.roles.some(x => verifyRole(x, currentRole)))
        : [];

    const sidebarMenuItems = (

        <Box sx={{display: "flex", flexDirection: "column", height: "100%", gap: 2}}>

            <Box sx={{
                display: "flex",
                justifyContent: props.isSidebarExpanded ? "space-between" : "center",
                alignItems: "center",
                fontSize: "28px",
                mt: "14px",
                pl: "15px",
                fontWeight: 700,
                letterSpacing: '-0.5px',
            }}
            >
                {!props.isSidebarExpanded && !props.isSmallScreen && (
                    <IconButton
                        onClick={() => props.setIsSidebarExpanded(true)}
                        disableRipple
                        sx={{color: 'gray', p: 1, mt: 2, mr: 1.8}}
                    >
                        <MenuOpenIcon sx={{transform: 'rotate(180deg)'}}/>
                    </IconButton>

                )}

            </Box>

            <Box className="sidebar-box">
                {props.isSidebarExpanded && !props.isSmallScreen && (
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => props.setIsSidebarExpanded(false)}
                            className="sidebar-button"

                        >
                            <ListItemIcon sx={{minWidth: 36, mr: 1.5, '& svg': {fontSize: 24}}}>
                                <MenuOpenIcon />
                            </ListItemIcon>
                            <ListItemText primary="Close" className="sidebar-text"/>
                        </ListItemButton>
                    </ListItem>

                )}
                <Divider sx={{mt: 2}}/>

                {visibleMenuItems.map(item => {
                    const Icon = item.icon ? iconRegistry[item.icon] : null;
                    return (
                        <ListItem disablePadding key={item.path}>
                            <ListItemButton
                                component={NavLink}
                                to={item.path}
                                sx={{
                                    '&.active': {
                                        bgcolor: 'rgba(115,154,214,0.2)',
                                        color: '#1e40af',
                                        borderLeft: '4px solid #3b82f6',
                                        fontWeight: 600,
                                        '& .MuiListItemIcon-root svg': {
                                            color: '#3b82f6',
                                        },
                                    },
                                }}
                                className="sidebar-button">

                                <ListItemIcon sx={{minWidth: 36, mr: 1.5, '& svg': {fontSize: 24}}}>
                                    {Icon && <Icon/>}
                                </ListItemIcon>
                                <ListItemText primary={item.label} className="sidebar-text"/>
                            </ListItemButton>
                        </ListItem>
                    );
                })}

            </Box>

            <Box sx={{mt: "auto", pb: 7, pl: "0px"}}>
                {!verifyRole(UserEnumType.GlobalAdmin, currentRole) && (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => setOpenSupportDialog(true)} className="sidebar-button">
                                <ListItemIcon className="sidebar-icon">
                                    <HelpOutlineIcon />
                                </ListItemIcon>
                                <ListItemText primary="Support" className="sidebar-text"/>
                            </ListItemButton>
                        </ListItem>
                        <CustomPopUp
                            open={openSupportDialog}
                            setOpen={setOpenSupportDialog}
                            title="Report an issue"
                            contentComponent={SupportIssueForm}
                            showActions={false}
                            width="500px"
                        />
                    </>
                )}

                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout} className="sidebar-button">
                        <ListItemIcon className="sidebar-icon">
                            <LogoutIcon sx={{transform: 'rotate(180deg)'}}/>
                        </ListItemIcon>
                        <ListItemText primary="Logout" className="sidebar-text"/>
                    </ListItemButton>
                </ListItem>
            </Box>

        </Box>
    );

    return (
        <Box sx={{display: "flex", height: "100vh"}}>
            <Drawer
                slotProps={{
                    backdrop: {
                        sx: {
                            position: 'absolute',
                            backgroundColor: 'transparent',
                        }
                    }
                }}
                variant={props.isSmallScreen ? "temporary" : "permanent"}
                anchor="left"
                open={props.isSmallScreen ? props.isDrawerOpen : true}
                onClose={() => props.setIsDrawerOpen(false)}
                sx={{
                    [`& .MuiDrawer-paper`]: {
                        width: props.isSidebarExpanded || props.isDrawerOpen ? 178 : 60,
                        transition: 'width 0.3s ease',
                        overflowX: 'hidden',
                        // backgroundImage: "linear-gradient(90deg, #4A90E2, #7de19a)",
                        backgroundImage: "linear-gradient(180deg, rgba(74,144,226,0.25) 0%, rgba(125,225,154,0.25) 100%)",
                        backdropFilter: !props.isSmallScreen ? "blur(6px)" : null,
                        color: "#1e293b",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        py: 3,
                        padding: 0,
                        boxShadow: 'none',
                        mt: 6.3
                    },
                }}
            >
                {sidebarMenuItems}
            </Drawer>
        </Box>

    );

}
export default Sidebar;