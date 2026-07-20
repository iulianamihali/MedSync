import './styles/CustomPieChart.scss';
import * as React from 'react';
import {useMemo} from 'react';
import {PieChart} from '@mui/x-charts/PieChart';
import {useDrawingArea} from '@mui/x-charts/hooks';
import {styled} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress, {linearProgressClasses} from '@mui/material/LinearProgress';
import type {PieChartData} from "../pages/dashboard/dashboardAdminGlobal/mainGrid/types";

type Props = {
    text: string;
    values: PieChartData[];
}

interface StyledTextProps {
    variant: 'primary' | 'secondary';
}

const StyledText = styled('text', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({ theme }) => ({
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fill: (theme.vars || theme).palette.text.secondary,
    variants: [
        {
            props: {
                variant: 'primary',
            },
            style: {
                fontSize: theme.typography.h5.fontSize,
            },
        },
        {
            props: ({ variant }) => variant !== 'primary',
            style: {
                fontSize: theme.typography.body2.fontSize,
            },
        },
        {
            props: {
                variant: 'primary',
            },
            style: {
                fontWeight: theme.typography.h5.fontWeight,
            },
        },
        {
            props: ({ variant }) => variant !== 'primary',
            style: {
                fontWeight: theme.typography.body2.fontWeight,
            },
        },
    ],
}));

interface PieCenterLabelProps {
    primaryText: string;
    secondaryText: string;
}

function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
    const { width, height, left, top } = useDrawingArea();
    const primaryY = top + height / 2 - 10;
    const secondaryY = primaryY + 24;

    return (
        <React.Fragment>
            <StyledText variant="primary" x={left + width / 2} y={primaryY}>
                {primaryText}
            </StyledText>
            <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
                {secondaryText}
            </StyledText>
        </React.Fragment>
    );
}

const colors = [
    'hsl(220, 20%, 65%)',
    'hsl(220, 20%, 42%)',
    'hsl(220, 20%, 35%)',
    'hsl(220, 20%, 25%)',
];

export default function CustomPieChart(props: Props) {

    const data = useMemo(() => {
        return props.values.map((value) => {
            return {label: value.name, value: value.total};
        });
    }, [props.values]);
    const totalSum = useMemo(() => {
        let x = 0;
        props.values.forEach((value) => {
            x += value.total;
        })
        return x;
    }, [props.values])

    return (
        <Card
            variant="outlined"
            sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, borderRadius: 2 }}
        >
            <CardContent>
                <Typography component="h2" variant="subtitle2">
                    {props.text}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PieChart
                        colors={colors}
                        margin={{
                            left: 80,
                            right: 80,
                            top: 80,
                            bottom: 80,
                        }}
                        series={[
                            {
                                data,
                                innerRadius: 75,
                                outerRadius: 100,
                                paddingAngle: 0,
                                highlightScope: { fade: 'global', highlight: 'item' },
                            },
                        ]}
                        height={260}
                        width={260}
                        hideLegend
                    >
                        <PieCenterLabel primaryText={totalSum?.toString()} secondaryText="Total" />
                    </PieChart>
                </Box>
                {props.values.map((inst, index) => (
                    <Stack
                        key={index}
                        direction="row"
                        sx={{ alignItems: 'center', gap: 2, pb: 2 }}
                    >
                        {/*{country.flag}*/}
                        <Stack sx={{ gap: 1, flexGrow: 1 }}>
                            <Stack
                                direction="row"
                                sx={{
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                    {inst.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {inst.percentage}%
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                aria-label="Number of appointments by institution"
                                value={inst.percentage}
                                sx={{
                                    [`& .${linearProgressClasses.bar}`]: {
                                        backgroundColor: colors[index % colors.length],
                                    },

                                }}
                            />
                        </Stack>
                    </Stack>

                ))}
            </CardContent>
        </Card>
    );
}