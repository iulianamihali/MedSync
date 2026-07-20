import '../forPatient/AIFloating.scss';
import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Slide from '@mui/material/Slide';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReactMarkdown from 'react-markdown';
import { keyframes } from '@mui/system';
import axiosUtil from "../../../common/axiosUtil";
import AppointmentCardAI from "../../AppointmentCardAI";
import GlobalSettings from '../../../GlobalSettings.json';
import useAuth from "../../../store/features/auth/authHook";
import type {DoctorAIMessage, DoctorAskResponseDto} from "../types";
import PatientSummaryCardAI from "../../PatientSummaryCardAI";
import AvailableSlotsCardAI from "../../AvailableSlotsCardAI";

const bounce = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(-4px); opacity: 1; }
`;

const Dot = ({ delay }: { delay: string }) => (
    <Box sx={{
        width: 6, height: 6,
        borderRadius: '50%',
        bgcolor: '#E8833A',
        animation: `${bounce} 1.2s infinite ease-in-out`,
        animationDelay: delay,
    }} />
);



export default function DoctorAIFloating() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<DoctorAIMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const doctorId = useAuth()?.user?.sub;
    const institutionId = useAuth()?.user?.ins;

    const handleSend = () => {
        if (!input.trim()) return;
        const currentInput = input;
        setMessages(prev => [...prev, { role: 'user', text: currentInput }]);
        setInput('');
        setIsLoading(true);

        const url = `${GlobalSettings.gemini}/doctor-ask`;

        axiosUtil.post<DoctorAskResponseDto>(url, JSON.stringify({
            doctorId,
            institutionId,
            message: currentInput,
            conversationHistory: messages.map(m => ({
                role: m.role,
                text: m.text ?? '',
            }))
        }), {
            headers: { 'Content-Type': 'application/json' }
        })
            .then(res => {
                setMessages(prev => [...prev, {
                    role: 'model',
                    text: res.data.message ?? undefined,
                    appointments: res.data.upcomingAppointments ?? undefined,
                    patients: res.data.patients ?? undefined,
                    availableSlots: res.data.availableSlots ?? undefined,

                }]);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <Box className="ai-floating-root">
            <Slide direction="up" in={open} mountOnEnter unmountOnExit>
                <Paper elevation={0} className="ai-floating-panel">
                    <Box className="ai-floating-header">
                        <Box className="ai-floating-header-left">
                            <Avatar className="ai-avatar">
                                <AutoAwesomeIcon sx={{ fontSize: 15 }} />
                            </Avatar>
                            <Typography className="ai-floating-title">
                                MedSync AI
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setOpen(false)} className="ai-close-btn">
                            <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>

                    <Divider className="ai-divider" />

                    <Box className="ai-messages">
                        {messages.length === 0 && (
                            <Box className="ai-empty">
                                <AutoAwesomeIcon className="ai-empty-icon" />
                                <Typography className="ai-empty-text">
                                    How can I help you, doctor?
                                </Typography>
                            </Box>
                        )}

                        {messages.map((msg, index) => (
                            <Box key={index} className={msg.role === 'user' ? 'ai-message ai-message-user' : 'ai-message ai-message-ai'}>
                                {msg.role === 'user' ? (
                                    <Typography className="ai-message-text">{msg.text}</Typography>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {msg.text && (
                                            <Box className="ai-message-text ai-message-markdown">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </Box>
                                        )}
                                        {msg.appointments && msg.appointments.length > 0 && (
                                            <AppointmentCardAI appointments={msg.appointments} />
                                        )}
                                        {msg.patients && msg.patients.length > 0 && (
                                            <PatientSummaryCardAI patients={msg.patients} />
                                        )}
                                        {msg.availableSlots && msg.availableSlots.length > 0 && (
                                            <AvailableSlotsCardAI slots={msg.availableSlots} />
                                        )}
                                    </Box>
                                )}
                            </Box>
                        ))}
                        {isLoading && (
                            <Box className="ai-message ai-message-ai">
                                <Box sx={{ display: 'flex', gap: '4px', p: '6px 10px' }}>
                                    <Dot delay="0s" />
                                    <Dot delay="0.2s" />
                                    <Dot delay="0.4s" />
                                </Box>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    <Divider className="ai-divider" />

                    <Box className="ai-input-row">
                        <TextField
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            fullWidth
                            variant="standard"
                            placeholder="Write a message..."
                            multiline
                            maxRows={3}
                            InputProps={{ disableUnderline: true }}
                            className="ai-input"
                        />
                        <IconButton onClick={handleSend} size="small" className="ai-send-btn">
                            <SendIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>

                    <Box className="ai-disclaimer">
                        <InfoOutlinedIcon className="ai-disclaimer-icon" />
                        <Typography component="span" className="ai-disclaimer-text">
                            AI can make mistakes. Please verify important medical information.
                        </Typography>
                    </Box>
                </Paper>
            </Slide>

            <Fab
                className={open ? 'ai-fab ai-fab-open' : 'ai-fab'}
                onClick={() => setOpen(!open)}
                size="medium"
            >
                {open ? <CloseIcon sx={{ fontSize: 20 }} /> : <AutoAwesomeIcon sx={{ fontSize: 20 }} />}
            </Fab>
        </Box>
    );
}