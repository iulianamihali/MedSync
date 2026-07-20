import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventIcon from '@mui/icons-material/Event';
import { useState } from 'react';
import type { DoctorPatientSummaryDto } from "./AI/types";

type Props = {
    patients: DoctorPatientSummaryDto[];
};

const cleanText = (text: string) => {
    return text
        .replace(/\[\d{4}-\d{2}-\d{2}\]\s*/g, '')
        .replace(/\s*\|.*$/g, '')
        .trim();
};

const cleanMedication = (text: string) => {
    const parts = text.split('|').map(p => p.trim());
    const name = parts[0] || '';
    const strength = parts.find(p => p.startsWith('strength:'))?.replace('strength:', '').trim();
    const dosage = parts.find(p => p.startsWith('dosage:'))?.replace('dosage:', '').trim();
    return `${name}${strength ? ` ${strength}` : ''}${dosage ? ` — ${dosage}` : ''}`;
};

const cleanReferral = (text: string) => {
    const parts = text.split('|').map(p => p.trim());
    const specialty = parts.find(p => p.startsWith('specialty:'))?.replace('specialty:', '').trim();
    const reason = parts.find(p => p.startsWith('reason:'))?.replace('reason:', '').trim();
    return `${specialty}${reason ? ` — ${reason}` : ''}`;
};

export default function PatientSummaryCardAI({ patients }: Props) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            {patients.map((patient) => (
                <Box
                    key={patient.patientId}
                    onClick={() => setExpandedId(expandedId === patient.patientId ? null : patient.patientId)}
                    sx={{
                        background: 'white',
                        border: '0.5px solid #e2e8f0',
                        borderRadius: '10px',
                        borderLeft: '3px solid #E8833A',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        cursor: 'pointer',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <PersonIcon sx={{ fontSize: 14, color: '#E8833A' }} />
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                                {patient.patientName}
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>
                            {patient.visits} vizite
                        </Typography>
                    </Box>

                    {patient.lastVisitUtc && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <EventIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                            <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>
                                Ultima vizită: {new Date(patient.lastVisitUtc).toLocaleDateString()}
                            </Typography>
                        </Box>
                    )}

                    {patient.diagnoses.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                            <LocalHospitalIcon sx={{ fontSize: 12, color: '#E8833A', mt: '2px' }} />
                            <Typography sx={{ fontSize: 10, color: '#64748b' }}>
                                {patient.diagnoses.slice(0, 2).map(d => cleanText(d)).join(' · ')}
                            </Typography>
                        </Box>
                    )}

                    {expandedId === patient.patientId && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', mt: '4px', borderTop: '1px solid #f1f5f9', pt: '6px' }}>
                            {patient.symptoms.length > 0 && (
                                <Box>
                                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#0f172a', mb: '2px' }}>Simptome</Typography>
                                    {patient.symptoms.map((s, i) => (
                                        <Typography key={i} sx={{ fontSize: 10, color: '#64748b', pl: '8px' }}>
                                            • {cleanText(s)}
                                        </Typography>
                                    ))}
                                </Box>
                            )}

                            {patient.medications.length > 0 && (
                                <Box>
                                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#0f172a', mb: '2px' }}>Medicație</Typography>
                                    {patient.medications.map((m, i) => (
                                        <Typography key={i} sx={{ fontSize: 10, color: '#64748b', pl: '8px' }}>
                                            • {cleanMedication(m)}
                                        </Typography>
                                    ))}
                                </Box>
                            )}

                            {patient.referrals.length > 0 && (
                                <Box>
                                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#0f172a', mb: '2px' }}>Trimiteri</Typography>
                                    {patient.referrals.map((r, i) => (
                                        <Typography key={i} sx={{ fontSize: 10, color: '#64748b', pl: '8px' }}>
                                            • {cleanReferral(r)}
                                        </Typography>
                                    ))}
                                </Box>
                            )}

                            {patient.recommendations.length > 0 && (
                                <Box>
                                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#0f172a', mb: '2px' }}>Recomandări</Typography>
                                    {patient.recommendations.map((r, i) => (
                                        <Typography key={i} sx={{ fontSize: 10, color: '#64748b', pl: '8px' }}>
                                            • {cleanText(r)}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}

                    <Typography sx={{ fontSize: 9, color: '#cbd5e1', textAlign: 'center' }}>
                        {expandedId === patient.patientId ? '▲ mai puțin' : '▼ mai mult'}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}