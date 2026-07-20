import {Box, Typography } from "@mui/material";
import {useState} from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type {AvailableSlotsDto} from "./AI/types";

type Props = {
    slots: AvailableSlotsDto[];
};


export default function AvailableSlotsCardAI({ slots }: Props) {
    const [showAll, setShowAll] = useState(false);
    const maxVisible = 5;
    const visibleSlots = showAll ? slots : slots.slice(0, maxVisible);

    const formatTime = (d: string) =>
        new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            {visibleSlots.map((slot, index) => (
                <Box key={index} sx={{
                    background: 'white',
                    border: '0.5px solid #e2e8f0',
                    borderRadius: '10px',
                    borderLeft: '3px solid #22c55e',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                    <Typography sx={{ fontSize: 11, color: '#0f172a' }}>
                        {formatDate(slot.start)} · {formatTime(slot.start)} - {formatTime(slot.end)}
                    </Typography>
                </Box>
            ))}
            {slots.length > maxVisible && !showAll && (
                <Typography
                    onClick={() => setShowAll(true)}
                    sx={{
                        fontSize: 11,
                        color: '#E8833A',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        padding: '4px',
                    }}
                >
                    +{slots.length - maxVisible} more slots
                </Typography>
            )}
        </Box>
    );
}