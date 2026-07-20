import './MainGrid.scss';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import StatCard from '../../../../components/StatCard';
import CustomBarChart from "../../../../components/CustomBarChart";
import CustomPieChart from "../../../../components/CustomPieChart";
import MuiToolbar from "@mui/material/Toolbar";
import HighlightedCard from "../../../../components/HighlightedCard";
import {useAppSelector} from "../../../../store/hook";
import dayjs, {Dayjs} from "dayjs";
import axiosUtil from "../../../../common/axiosUtil";
import type {PieChartData, StatCardsResponseDto, SupportBarChartStatPoints} from "./types";
import {useEffect, useMemo, useState} from "react";
import GlobalSettings from '../../../../GlobalSettings.json';
import {CircularProgress, Typography} from "@mui/material";
import {supportIssuesTranslations} from "./Utils";
import {useFilterDescription} from "../../../../utils/filterDescription";
import CustomPopUp from "../../../../components/CustomPopUp";
import ContentInstitutionRequests from "./institutionRequestsView/ContentInstitutionRequests";


export default function MainGrid() {
    const dashboardFilter = useAppSelector(state => state.dashboardFilter);
    const [cardStats, setCardStats] = useState<StatCardsResponseDto | null>(null);
    const [barChartSupportStats, setBarChartSupportStats] = useState<SupportBarChartStatPoints[]>([]);
    const [pieChartTopInst, setPieChartTopInst] = useState<PieChartData[]>([]);
    const [isFetchingCards, setIsFetchingCards] = useState<boolean>(false);
    const [isFetchingSupportBarChart, setIsFetchingSupportBarChat] = useState<boolean>(false);
    const [isFetchingPieChartTopInst, setIsFetchingPieChartTopInst] = useState<boolean>(false);
    const [countInstitutionRequests, setCountInstitutionRequests] = useState<number>();
    const [open, setOpen] = useState<boolean>(false);

    const xValuesSupport = useMemo(() => {
        const xValues = [] as string[];
        barChartSupportStats.forEach((value) => {
            const name = supportIssuesTranslations[value.type];
            xValues.push(name);
        });
        return xValues;
    }, [barChartSupportStats]);

    const yValuesSupport = useMemo(() => {
        return barChartSupportStats.map((value) => value.value);
    }, [barChartSupportStats]);

    useEffect(() => {
        if (dashboardFilter?.from !== null && dashboardFilter?.to !== null)
        {
            getStatsCards(dayjs(dashboardFilter.from), dayjs(dashboardFilter.to));
            getSupportStatsBarChart(dayjs(dashboardFilter.from), dayjs(dashboardFilter.to));
            getPieChartTopInst(dayjs(dashboardFilter.from), dayjs(dashboardFilter.to));
        }
    }, [dashboardFilter?.from, dashboardFilter?.to]);

    useEffect(() => {
        getCountInstitutionRequests();
    },[])

    useEffect(() => {
        if (!open)
            getCountInstitutionRequests();
    },[open])

    const getStatsCards = (from: Dayjs, to: Dayjs) => {
        setIsFetchingCards(true);
        const url = `${GlobalSettings.globalAdminRoute}/dashboardStatsCards?from=${from.toISOString()}&to=${to.toISOString()}`;
         axiosUtil.get<StatCardsResponseDto>(url )
             .then (res => {
                 setCardStats(res.data);
                 setIsFetchingCards(false);
             })
             .catch(err => {
                 setIsFetchingCards(false);
                 console.error(err);
             });
    }

    const getSupportStatsBarChart = (from: Dayjs, to: Dayjs) => {
        const url = `${GlobalSettings.globalAdminRoute}/dashboardSupportStatsBarChart?from=${from.toISOString()}&to=${to.toISOString()}`;
        setIsFetchingSupportBarChat(true);
        axiosUtil.get<SupportBarChartStatPoints[]>(url)
            .then (res => {
                setBarChartSupportStats(res.data);
                setIsFetchingSupportBarChat(false);
            })
            .catch(err => {
                setIsFetchingSupportBarChat(false);
                console.error(err);
            })

    }

    const getPieChartTopInst = (from: Dayjs, to: Dayjs) => {
        const url = `${GlobalSettings.globalAdminRoute}/dashboardTopInstitutionsPieChart?from=${from.toISOString()}&to=${to.toISOString()}`;
        axiosUtil.get<PieChartData[]>(url)
            .then(res => {
                setPieChartTopInst(res.data);
                setIsFetchingPieChartTopInst(false);
            })
            .catch(err => {
                setIsFetchingPieChartTopInst(false);
                console.error(err);
            })
    }

    const getCountInstitutionRequests = () => {
        const url = `${GlobalSettings.institutionRoute}/countInstitutionRequests`;
        axiosUtil.get<number>(url)
            .then (res => {
                setCountInstitutionRequests(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }

    const description = useFilterDescription();
    const showCircularProgress = (cardStats === null) || isFetchingCards || isFetchingSupportBarChart || isFetchingPieChartTopInst;

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
                    Overview
                </Typography>
            </Box>
            {showCircularProgress ? (
                <CircularProgress className="circular-progress-main-grid"/>
            )
                : (
                    <Grid
                        container
                        spacing={2}
                        columns={12}
                        sx={{ mb: (theme) => theme.spacing(2)}}
                    >
                        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                            <HighlightedCard
                                text="Institution approvals"
                                typeRequest="institution"
                                countRequests={countInstitutionRequests ?? 0}
                                onClickCallback={() => setOpen(true)}
                            />
                        </Grid>
                        <Grid  size={{ xs: 12, sm: 6, lg: 3 }}>
                            <StatCard {...cardStats?.patients}
                                      interval={description}
                            />
                        </Grid>
                        <Grid  size={{ xs: 12, sm: 6, lg: 3 }}>
                            <StatCard {...cardStats?.doctors}
                                      interval={description}
                            />
                        </Grid>
                        <Grid  size={{ xs: 12, sm: 6, lg: 3 }}>
                            <StatCard {...cardStats?.institutions}
                                      interval={description}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, lg: 9}}>
                            <CustomBarChart
                                title={"Reported issues"}
                                description={description}
                                xValues={xValuesSupport}
                                yValues={yValuesSupport}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, lg: 3 }}>
                            <CustomPieChart
                                text={"Top institutions by appointments"}
                                values={pieChartTopInst}
                            />
                        </Grid>
                        <CustomPopUp open={open}
                                     setOpen={setOpen}
                                     title={"Institutions waiting for approval"}
                                     contentComponent={ContentInstitutionRequests}
                                     showActions={false}
                        />
                    </Grid>
                )}
        </Box>
    );
}