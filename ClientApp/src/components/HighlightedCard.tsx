import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export type Props = {
    text: string;
    typeRequest: string;
    countRequests: number;
    onClickCallback: () => void;
}

export default function HighlightedCard(props: Props) {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Card sx={{ height: '100%', bgcolor: '#f4f7fa', borderRadius: 2 }}>
            <CardContent>
                <AccessTimeRoundedIcon />
                <Typography
                    component="h2"
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: '600' }}
                >
                    {props.text}
                </Typography>
                <Typography sx={{ color: 'text.secondary', mb: '8px' }}>
                    {props.countRequests} new {props.countRequests === 1 ? props.typeRequest : props.typeRequest + "s"}  waiting for approval.
                </Typography>
                {props.countRequests != 0 &&
                <Button
                    onClick={props.onClickCallback}
                    variant="contained"
                    size="small"
                    color="primary"
                    endIcon={<ChevronRightRoundedIcon />}
                    fullWidth={isSmallScreen}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        padding:0.7,
                        backgroundImage: 'linear-gradient(to bottom, hsl(220, 20%, 25%), hsl(220, 30%, 6%))',
                        border: '1px solid hsl(220, 20%, 25%)',
                        boxShadow: 'inset 0 1px 0 hsl(220, 20%, 35%), inset 0 -1px 0 1px hsl(220, 0%, 0%)',
                        '&:hover': {
                            backgroundImage: 'linear-gradient(to bottom, hsl(220, 25%, 30%), hsl(220, 30%, 10%))',
                        },
                    }}
                >
                    Review now
                </Button>}
            </CardContent>
        </Card>
    );
}