import Box from '@mui/material/Box';
import MuiToolbar from "@mui/material/Toolbar";
import {Typography} from "@mui/material";
import Grid from "@mui/material/Grid";
import MetricCard from "../../../../components/MetricCard";
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import {useFilterDescription} from "../../../../utils/filterDescription";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import type {
    CountsStatCardsResponseDto,
    DetailsUpcomingAppointmentsResponseDto,
    DoctorFeedbackResponseDto
} from "./types";
import GlobalSettings from "../../../../GlobalSettings.json";
import axiosUtil from "../../../../common/axiosUtil";
import {useEffect, useState} from "react";
import useAuth from "../../../../store/features/auth/authHook";
import UpcomingAppointments from "../upcomingAppointments/UpcomingAppointments";
import dayjs, {type Dayjs} from "dayjs";
import {useAppSelector} from "../../../../store/hook";
import ReferralModal from "../../../patients/components/ReferralModal";
import CustomPopUp from "../../../../components/CustomPopUp";
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import DoctorFeedbackCard from "../../../doctors/DoctorFeedbackCard";
import NoteAddIcon from "@mui/icons-material/NoteAdd";

export default function MainGridDoctor () {
    const dashboardFilter = useAppSelector(state => state.dashboardFilter);
    const ins = useAuth().user?.ins;
    const doctorId = useAuth().user?.sub;
    const [cardStats, setCardStats] = useState<CountsStatCardsResponseDto | null>(null);
    const [openEdit, setOpenEdit] = useState<boolean>(false);

    const description = useFilterDescription();
    const [detailsUpcomingAppointments, setDetailsUpcomingAppointments] = useState<DetailsUpcomingAppointmentsResponseDto[]>([]);
    const [doctorFeedback, setDoctorFeedback] = useState<DoctorFeedbackResponseDto| null>(null);

    const getDetailsUpcomingAppointments = (institutionId: string, doctorId: string) => {
        const url = `${GlobalSettings.appointmentRoute}/getUpcomingAppointmentsForDoctor/${institutionId}/${doctorId}`;
        axiosUtil.get<DetailsUpcomingAppointmentsResponseDto[]>(url )
            .then (res => {
                setDetailsUpcomingAppointments(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    }

    const getDoctorFeedback = (institutionId: string, doctorId: string) => {
        const url = `${GlobalSettings.doctorRoute}/getDoctorFeedback/${institutionId}/${doctorId}`;
        axiosUtil.get<DoctorFeedbackResponseDto>(url )
            .then (res => {
                setDoctorFeedback(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    }

    useEffect(() => {
        if(ins && doctorId)
        {
            getDetailsUpcomingAppointments(ins, doctorId);
            getDoctorFeedback(ins, doctorId);
        }
    }, [ins, doctorId]);

    const getStatsCards = (from: Dayjs, to: Dayjs, institutionId: string, doctorId: string) => {
        const url = `${GlobalSettings.doctorRoute}/dashboardStatsCards?from=${from.toISOString()}&to=${to.toISOString()}&institutionId=${institutionId}&doctorId=${doctorId}`;
        axiosUtil.get<CountsStatCardsResponseDto>(url )
            .then (res => {
                setCardStats(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    }
    useEffect(() => {
        if(dashboardFilter && ins && doctorId)
            getStatsCards(dayjs(dashboardFilter.from), dayjs(dashboardFilter.to), ins, doctorId);
    }, [dashboardFilter, ins, doctorId]);


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

            <Grid
                container
                spacing={2}
                columns={12}
                sx={{mb: (theme) => theme.spacing(2)}}
            >
                <Grid size={{xs: 12, sm: 6, lg: 3}}>
                    <MetricCard title="Total Patients"
                                value={cardStats?.totalPatientsWithAppointments}
                                interval={"Patients with appointments"}
                                color='#1976D2'
                                icon={PeopleAltOutlinedIcon}
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6, lg: 3}}>
                    <MetricCard title="Appointments"
                                    value={cardStats?.totalAppointmentsByPeriod}
                                    interval={description}
                                    color='#2E7D32'
                                    icon={CalendarMonthOutlinedIcon}
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6, lg: 3}}>
                    <MetricCard title="Referrals "
                                value={cardStats?.totalReferralsByAppointment}
                                interval={description}
                                color="#f9acb3"
                                icon={AssignmentOutlinedIcon}
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6, lg: 3}}>
                    <MetricCard title="Prescriptions "
                                value={cardStats?.totalPrescriptionsByAppointment}
                                interval={description}
                                color="#7B1FA2"
                                icon={NoteAddIcon}
                    />
                </Grid>

                <Grid size={{xs: 12, lg: 7}}>
                    <UpcomingAppointments
                        items={detailsUpcomingAppointments}
                        onClickCallBack={() => {
                            if(ins && doctorId)
                                getDetailsUpcomingAppointments(ins, doctorId);
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, lg: 5}}>
                    <DoctorFeedbackCard
                        doctorFeedback={doctorFeedback}
                    />
                </Grid>
            </Grid>
            <CustomPopUp
                open={openEdit}
                setOpen={setOpenEdit}
                title={"New Referral"}
                contentComponent={ReferralModal}
                showActions={true}
                textButton={"Save"}
            />
        </Box>
    );
}