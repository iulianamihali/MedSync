import {Link, Typography} from "@mui/material";
import { Box } from "@mui/system";
import type {ClinicLocation} from "../types";
import type {BookingFor} from "../../../../careGiving/CareGiving";
import {useNavigate} from "react-router-dom";

type Props = {
    location: ClinicLocation;
    bookingFor?: BookingFor;
}

export default function CardClinicPreview(props: Props) {
    const navigate = useNavigate();

    return (
        <Box sx={{
            backgroundColor: 'white',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            minWidth: 190,
            maxWidth: 210,

            '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 12,
                height: 12,
                backgroundColor: 'white',
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }
        }}>
            <Box sx={{
                height: 3,
                background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)',
            }}/>

            <Box sx={{ padding: '10px 14px 12px' }}>
                <Typography sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '-0.2px',
                }}>
                    {props.location.institutionName}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mt: '4px' }}>
                    <Box component="span" sx={{ fontSize: 10, color: '#94a3b8' }}>📍</Box>
                    <Typography sx={{
                        fontSize: 10,
                        color: '#94a3b8',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {props.location.fullAddress}
                    </Typography>
                </Box>

                <Box sx={{ height: '1px', backgroundColor: '#f1f5f9', my: '8px' }}/>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Typography sx={{ fontSize: 12, color: '#f59e0b', lineHeight: 1 }}>★</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{props.location.rating}</Typography>
                    </Box>
                    <Typography sx={{
                        fontSize: 10,
                        color: '#94a3b8',
                        backgroundColor: '#f8fafc',
                        borderRadius: '6px',
                        padding: '2px 6px',
                    }}>
                        {props.location.totalRatings} reviews
                    </Typography>
                </Box>
                <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: "5px" }}
                >
                    <Link
                        component="button"
                        sx={{ fontSize: "0.8rem" }}
                        onClick={() => navigate(`/institutionDetails/${props.location.id}`, {
                            state: props.bookingFor ?? null
                        })}
                    >
                        See details
                    </Link>
                </Box>
            </Box>
        </Box>
    )
}