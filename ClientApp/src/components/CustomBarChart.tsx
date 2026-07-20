import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {useMemo} from "react";
import { BarChart } from "@mui/x-charts";

type Props = {
    title: string;
    description?: string;
    xValues: string[];
    yValues: number[];
    color?: string;
}

export default function CustomBarChart(props: Props) {

    const totalValue = useMemo(() => {
        if(!props.yValues)
            return 0;
        let total = 0;
        props.yValues.forEach(value => {
            total += value;
        });
        return total;
    }, [props.yValues])

    return (
        <Card variant="outlined" sx={{ width: '100%', borderRadius: 2 }}>
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    {props.title}
                </Typography>
                <Stack sx={{ justifyContent: 'space-between' }}>
                    <Stack
                        direction="row"
                        sx={{
                            alignContent: { xs: 'center', sm: 'flex-start' },
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Typography variant="h4" component="p">
                            {totalValue}
                        </Typography>
                        {/*<Chip size="small" color="error" label="-8%" />*/}
                    </Stack>
                    {props.description && <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {props.description}
                    </Typography>}
                </Stack>
                <BarChart
                    borderRadius={8}
                    xAxis={[
                        {
                            scaleType: 'band',
                            categoryGapRatio: 0.5,
                            data: props.xValues,
                            height: 24,
                        },
                    ]}
                    yAxis={[{ width: 50 }]}
                    series={[
                        {
                            id: 'reports',
                            label: 'Reports count',
                            data: props.yValues,
                            color: props.color ? props.color : 'rgb(133,160,216)'
                        },
                    ]}
                    height={250}
                    margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
                    grid={{ horizontal: true }}
                    hideLegend
                    sx={{

                        '& .MuiChartsGrid-line': {
                            strokeDasharray: '3 3',
                            stroke: 'rgba(0, 0, 0, 0.15)',
                        },

                        '& .MuiChartsAxis-line': {
                            strokeDasharray: '0',
                            stroke: 'rgba(0, 0, 0, 0.4)',
                        },
                    }}
                />
            </CardContent>
        </Card>
    );
}