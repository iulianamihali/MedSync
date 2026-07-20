import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import type { InstitutionDetailsResponse } from "../pages/institutions/types";

type Props = {
    clinics: InstitutionDetailsResponse[];
}

export default function ClinicCardAI({ clinics }: Props) {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            {clinics.map((clinic) => (
                <Box key={clinic.institutionId} sx={{
                    background: 'white',
                    border: '0.5px solid #e2e8f0',
                    borderRadius: '10px',
                    borderLeft: '3px solid #E8833A',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                            {clinic.institutionName}
                        </Typography>
                        <Link
                            component="button"
                            onClick={() => navigate(`/institutionDetails/${clinic.institutionId}`)}
                            sx={{ fontSize: 11, whiteSpace: 'nowrap', color: '#E8833A', fontWeight: 600 }}
                        >
                            See details →
                        </Link>
                    </Box>

                    <Typography sx={{ fontSize: 10, color: '#64748b' }}>
                        📍 {clinic.address}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>
                            ★ {clinic.rating} · {clinic.totalReviews} reviews
                        </Typography>
                        {clinic.distance != null && (
                            <Typography sx={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: clinic.distance < 10 ? '#22c55e' : clinic.distance < 50 ? '#f59e0b' : '#ef4444'
                            }}>
                                📏 {clinic.distance} km away
                            </Typography>
                        )}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}