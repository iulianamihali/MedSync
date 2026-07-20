import Box from "@mui/material/Box";
import {
    Avatar,
    Divider,
    Rating,
    Stack, Tab, Tabs,
    Typography,
} from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import "./InstitutionDetails.scss";
import type {InstitutionDetailsResponse} from "../types";
import GlobalSettings from "../../../GlobalSettings.json";
import axiosUtil from "../../../common/axiosUtil";
import {useEffect, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import FindDoctorForMeTab from "./tabs/FindDoctorForMeTab";
import { FaRegHospital } from "react-icons/fa";
import ViewAllDoctorsTab from "./tabs/ViewAllDoctorsTab";
import type {BookingFor} from "../../careGiving/CareGiving";

export default function InstitutionDetails() {
    const { institutionId } = useParams();
    const location = useLocation();
    const bookingFor = location.state as BookingFor | undefined;
    const [institutionDetails, setInstitutionDetails] = useState<InstitutionDetailsResponse>();
    const [activeTab, setActiveTab] = useState<string>("findDoctor");

    const getInstitutionDetails = (institutionId: string) => {
        const url = `${GlobalSettings.institutionRoute}/getInstitutionDetails/${institutionId}`;
        axiosUtil
            .get<InstitutionDetailsResponse>(url)
            .then((res) => setInstitutionDetails(res.data))
            .catch((err) => console.error(err));
    }

    useEffect(() => {
        if(institutionId)
            getInstitutionDetails(institutionId);
    }, [institutionId]);

    return (
        <Box className="institution-details-page">
            <Box className="institution-details-card">
                <Box className="institution-details-header">
                    <Box className="institution-details-left">
                        <Avatar className="institution-avatar">
                            <FaRegHospital className="institution-avatar-icon" />
                        </Avatar>

                        <Box className="institution-main-info">
                            <Typography variant="h5" className="institution-title">
                                {institutionDetails?.institutionName}
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                className="institution-rating-row"
                            >
                                <Rating value={institutionDetails?.rating ?? 0} precision={0.5} readOnly size="small" />
                                <Typography variant="body2" className="institution-muted-text">
                                    {institutionDetails?.rating}
                                </Typography>
                                <Typography variant="body2" className="institution-muted-text">
                                    {institutionDetails?.totalReviews} reviews
                                </Typography>
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                className="institution-location-row"
                            >
                                <LocationOnOutlinedIcon className="institution-location-icon" />
                                <Typography variant="body2" className="institution-muted-text">
                                    {institutionDetails?.address}
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>

                </Box>

                <Divider className="institution-divider" />

            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="Find a doctor for me" value={"findDoctor"}/>
                    <Tab label="View all doctors" value={"viewDoctors"}/>
                </Tabs>
            </Box>

            {activeTab === "findDoctor" && (<FindDoctorForMeTab institutionId={institutionId} bookingFor={bookingFor}/>)}
            {activeTab === "viewDoctors" && (<ViewAllDoctorsTab institutionId={institutionId || ""} bookingFor={bookingFor}/>)}
        </Box>
    );
}