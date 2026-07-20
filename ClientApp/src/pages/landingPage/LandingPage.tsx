import "./LandingPage.scss";
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

const features = [
    {
        icon: <CalendarMonthOutlinedIcon />,
        title: "Easy booking",
        description: "Find clinics and book in seconds.",
        color: "#e0f2f1",
        iconColor: "#00897b",
    },
    {
        icon: <HistoryOutlinedIcon />,
        title: "Medical history",
        description: "Records and referrals in one place.",
        color: "#e3f2fd",
        iconColor: "#1e88e5",
    },
    {
        icon: <GroupsOutlinedIcon />,
        title: "Caregiving",
        description: "Manage health for your loved ones.",
        color: "#fff8e1",
        iconColor: "#f9a825",
    },
    {
        icon: <DescriptionOutlinedIcon />,
        title: "Prescriptions",
        description: "Track medications digitally.",
        color: "#f3e5f5",
        iconColor: "#8e24aa",
    },
    {
        icon: <PlaceOutlinedIcon />,
        title: "Find clinics",
        description: "Discover nearby clinics on map.",
        color: "#fce4ec",
        iconColor: "#e53935",
    },
    {
        icon: <ShieldOutlinedIcon />,
        title: "Secure sharing",
        description: "Share history via secure links.",
        color: "#fff3e0",
        iconColor: "#ef6c00",
    },
];

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box className="landing">
            <Box className="landing__layout">
                <Box className="landing__hero">
                    <img src="/assets/logo.png" alt="MedSync" className="landing__logo" />

                    <Typography className="landing__title">
                        Your health,<br />simplified
                    </Typography>
                    <Typography className="landing__subtitle">
                        Manage appointments, medical history, prescriptions,
                        and the health of those you love — all from one place.
                    </Typography>

                    <Box className="landing__actions">
                        <Button
                            variant="contained"
                            className="landing__btn-primary"
                            onClick={() => navigate("/signup")}
                        >
                            Get started
                        </Button>
                        <Button
                            variant="outlined"
                            className="landing__btn-secondary"
                            onClick={() => navigate("/login")}
                        >
                            Log in
                        </Button>
                    </Box>

                    <Typography className="landing__clinic-link">
                        For clinics –{" "}
                        <span onClick={() => navigate("/institution-request")}>
                            register your institution
                        </span>
                    </Typography>
                </Box>

                <Box className="landing__features">
                    {features.map((feature, index) => (
                        <Box key={index} className="landing__feature-card">
                            <Box
                                className="landing__feature-icon"
                                sx={{ backgroundColor: feature.color, color: feature.iconColor }}
                            >
                                {feature.icon}
                            </Box>
                            <Box>
                                <Typography className="landing__feature-title">
                                    {feature.title}
                                </Typography>
                                <Typography className="landing__feature-desc">
                                    {feature.description}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default LandingPage;