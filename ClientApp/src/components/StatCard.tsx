import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import DateTimeFormat from "../common/dateTimeUtil";

export type StatCardsProps = {
    title: string;
    value: number;
    interval?: string;
    trendValue: number;
    trend: 'up' | 'down' | 'neutral';
    chartData: ChartStatPoint[];
}

export type ChartStatPoint = {
    date: string;
    value: number;
}

function AreaGradient({ color, id }: { color: string; id: string }) {
    return (
        <defs>
            <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
        </defs>
    );
}

export default function StatCard({
                                     title,
                                     value,
                                     interval,
                                     trendValue,
                                     trend,
                                     chartData,
                                 }: StatCardsProps) {
    const trendColors = {
        up: 'rgb(66, 214, 118)',
        down: 'rgb(240, 98, 91)',
        neutral: 'rgb(176 190 197 / 0.9)',
    };

    const getKeysForChart = (data: ChartStatPoint[]):string[] => {
        const dateTimes: string[] = [];
        if(data?.length > 0)
        {
            data.forEach((item) => {
                dateTimes.push(DateTimeFormat.dayMonthYearFormat(item.date));
            })
        }
        return dateTimes;
    }
    const keysForChart = getKeysForChart(chartData);

    const chartColor = trendColors[trend];

    return (
        <Card variant="outlined" sx={{ height: '100%', flexGrow: 1, borderRadius: 2 }}>
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    {title}
                </Typography>
                <Stack
                    direction="column"
                    sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
                >
                    <Stack sx={{ justifyContent: 'space-between' }}>
                        <Stack
                            direction="row"
                            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <Typography variant="h4" component="p">
                                {value}
                            </Typography>
                            <Chip size="small"
                                  sx={{
                                      color: '#fff',
                                      backgroundColor: trendColors[trend],
                                      fontWeight: 500,
                                  }}
                                  label={trend === "up" ? `+${trendValue}%` :
                                      trend === "down" ? `${trendValue}%` : ''}
                            />
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {interval}
                        </Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 50 }}>
                        {keysForChart?.length > 0 ?
                            <SparkLineChart
                                color={chartColor}
                                data={chartData?.map(x => x.value)}
                                area
                                showHighlight
                                showTooltip
                                xAxis={{
                                    scaleType: 'band',
                                    data: keysForChart,
                                }}
                                sx={{
                                    [`& .${areaElementClasses.root}`]: {
                                        fill: `url(#area-gradient-${value})`,
                                    },
                                }}
                            >
                                <AreaGradient color={chartColor} id={`area-gradient-${value}`} />
                            </SparkLineChart>
                        : null}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}