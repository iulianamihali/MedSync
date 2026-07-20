import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';

export type MetricCardProps = {
    title: string;
    value?: number | string;
    icon: SvgIconComponent;
    color: string;
    interval?: string;
};

export default function MetricCard(props: MetricCardProps) {

    return (
        <Card
            variant="outlined"
            sx={{
                height: '100%',
                flexGrow: 1,
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                ':hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
            }}
        >
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    {props.title}
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
                                {props.value}
                            </Typography>
                            <props.icon sx={{ fontSize: 28, color: props.color, opacity: 0.7 }} />
                        </Stack>
                        {props.interval && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1.5 }}>
                                {props.interval}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}