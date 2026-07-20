import Box from '@mui/material/Box';
import MuiToolbar from "@mui/material/Toolbar";
import {Typography} from "@mui/material";
import Grid from "@mui/material/Grid";
import MetricCard from "../../../../components/MetricCard";
import EventIcon from '@mui/icons-material/Event';
import {useFilterDescription} from "../../../../utils/filterDescription";
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import {useEffect, useState} from "react";
import RecentAppointments from "../recentAppointments/RecentAppointments";
import QuickActions from "../QuickActions";
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MedicalInformationRoundedIcon from '@mui/icons-material/MedicalInformationRounded';
import {useNavigate} from "react-router-dom";
import dayjs, {type Dayjs} from "dayjs";
import GlobalSettings from "../../../../GlobalSettings.json";
import axiosUtil from "../../../../common/axiosUtil";
import type {CountsStatCardsResponseDto, DetailsRecentAppointmentsResponseDto} from "./types";
import {useAppSelector} from "../../../../store/hook";
import useAuth from "../../../../store/features/auth/authHook";
import {CircularProgress} from "@mui/material";
import CustomPopUp from "../../../../components/CustomPopUp";
import ContentDoctorRequests from "./doctorRequestsView/ContentDoctorRequests";
import PostAddIcon from "@mui/icons-material/PostAdd";

export default function MainGridLocal() {
    const dashboardFilter = useAppSelector(state => state.dashboardFilter);
    const ins = useAuth().user?.ins;
    const description = useFilterDescription();
    const [cardStats, setCardStats] = useState<CountsStatCardsResponseDto | null>(null);
    const [isFetchingCards, setIsFetchingCards] = useState<boolean>(false);
    const [detailsRecentAppointments, setDetailsRecentAppointments] = useState<DetailsRecentAppointmentsResponseDto[]>([]);
    const [isFetchingDetailsRecentApp, setIsFetchingDetailsRecentApp] = useState<boolean>(false);
    const [openEdit, setOpenEdit] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (dashboardFilter !== null && ins != null)
        {
            getStatsCards(dayjs(dashboardFilter.from), dayjs(dashboardFilter.to), ins);
        }
    }, [dashboardFilter, ins]);

    useEffect(() => {
        if (ins)
            getDetailsRecentAppointments(ins);
    }, [ins]);

    const getStatsCards = (from: Dayjs, to: Dayjs, institutionId: string) => {
        const url = `${GlobalSettings.localAdminRoute}/dashboardStatsCards?from=${from.toISOString()}&to=${to.toISOString()}&institutionId=${institutionId}`;
        setIsFetchingCards(true);
        axiosUtil.get<CountsStatCardsResponseDto>(url )
            .then (res => {
                setCardStats(res.data);
                setIsFetchingCards(false);
            })
            .catch(err => {
                setIsFetchingCards(false);
                console.error(err);
            });
    }
    const getDetailsRecentAppointments = (institutionId: string) => {
        const url = `${GlobalSettings.localAdminRoute}/detailsRecentAppointments/${institutionId}`;
        setIsFetchingDetailsRecentApp(true);
        axiosUtil.get<DetailsRecentAppointmentsResponseDto[]>(url )
            .then (res => {
                setDetailsRecentAppointments(res.data);
                setIsFetchingDetailsRecentApp(false);
            })
            .catch(err => {
                setIsFetchingDetailsRecentApp(false);
                console.error(err);
            });

    }

    return (
                <Box sx={{width: '100%', maxWidth: {sm: '100%', md: '1700px'}}}>

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
                            Overview
                        </Typography>
                    </Box>
                    {isFetchingCards ?
                            <CircularProgress className="circular-progress-main-grid"/>
                        :
                    <Grid
                        container
                        spacing={2}
                        columns={12}
                        sx={{mb: (theme) => theme.spacing(2)}}
                    >
                        <Grid size={{xs: 12, sm: 6, lg: 3}}>
                            <MetricCard title="Appointments"
                                        value={cardStats?.appointmentsCount}
                                        interval={description}
                                        color='#1976D2'
                                        icon={EventIcon}
                            />
                        </Grid>
                        <Grid size={{xs: 12, sm: 6, lg: 3}}>
                            <MetricCard title="Total doctors"
                                        value={cardStats?.doctorsCount}
                                        color='#43A047'
                                        icon={BadgeOutlinedIcon}
                            />
                        </Grid>
                        <Grid size={{xs: 12, sm: 6, lg: 3}}>
                            <MetricCard title="Canceled appointments"
                                        value={cardStats?.canceledAppointmentsCount}
                                        interval={description}
                                        color='#E57373'
                                        icon={CancelOutlinedIcon}
                            />
                        </Grid>
                        <Grid size={{xs: 12, sm: 6, lg: 3}}>
                            <MetricCard title="Appointments with Referral"
                                        value={cardStats?.appointmentsWithReferralCount}
                                        interval={description}
                                        color='#0097A7'
                                        icon={MedicalInformationRoundedIcon}
                            />
                        </Grid>
                        <Grid size={{xs: 12, md: 6, lg: 8}}>
                            <RecentAppointments items={
                                detailsRecentAppointments
                            }
                            onClickCallBack={() => {
                                if(ins)
                                    getDetailsRecentAppointments(ins)}}
                            />
                        </Grid>
                        <Grid size={{xs: 12, lg: 4}}>
                            <QuickActions
                                actions={[
                                    {
                                        id: 1,
                                        title: "Doctor Approvals",
                                        buttonText: "Open",
                                        icon: <PersonAddAltIcon sx={{color: "#1976D2"}}/>,
                                        onClickCallBack: () => setOpenEdit(true),
                                    },

                                    {
                                        id: 2,
                                        title: "View Appointments",
                                        buttonText: "View",
                                        icon: <EventNoteIcon sx={{color: "#EF6C00"}}/>,
                                        onClickCallBack: () => navigate('/appointments'),
                                    },
                                    {
                                        id: 3,
                                        title: "Create Appointment",
                                        buttonText: "Create",
                                        icon: <PostAddIcon sx={{color: "#009688"}}/>,
                                        onClickCallBack: () => navigate('/appointments', {
                                            state: { openCreateAppointment: true }
                                        }),
                                    },
                                ]}
                            />
                        </Grid>
                        <CustomPopUp
                            open={openEdit}
                            setOpen={setOpenEdit}
                            title={"Doctors waiting for approval"}
                            contentComponent={ContentDoctorRequests}
                            showActions={false}
                        />
                    </Grid>
                        }
                </Box>

    );
}