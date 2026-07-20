import './AIFloating.scss';
import {useEffect, useRef, useState} from 'react';
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
import {type AIMessage, type AskResponseDto, MessageRole, type UserCoordinates} from "../types";
import axiosUtil from "../../../common/axiosUtil";
import GlobalSettings from "../../../GlobalSettings.json";
import ReactMarkdown from 'react-markdown';
import {keyframes} from '@mui/system';
import ClinicCardAI from "../../ClinicCardAI";
import useAuth from "../../../store/features/auth/authHook";

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

export default function AIFloating() {
    const patientId = useAuth()?.user?.sub;
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
            }
        );
    }, []);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: MessageRole.User, text: input }]);
        setInput('');
        const url = `${GlobalSettings.gemini}/ask`;
        setIsLoading(true);
        axiosUtil.post<AskResponseDto>(url,  JSON.stringify({
            patientId: patientId,
            message: input,
            userCoordinates: userLocation ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
            } : null,
            conversationHistory: messages.map(m => ({
                role: m.role === MessageRole.MedicalAssistant ? 'model' : 'user',
                text: m.text ?? '',
            }))
        }),
            {
            headers: { 'Content-Type': 'application/json' }
        })
            .then(res => {
               setMessages((prev) => [...prev, {
                   role: MessageRole.MedicalAssistant,
                   text: res.data.message,
                   clinics: res.data.clinics,
               }]);
               setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            })
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
                                    How can I help you?
                                </Typography>
                            </Box>
                        )}

                        {messages.map((msg, index) => (
                            <Box key={index} className={msg.role === MessageRole.User ? 'ai-message ai-message-user' : 'ai-message ai-message-ai'}>
                                {msg.clinics && msg.clinics.length > 0
                                    ? (  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <Typography className="ai-message-text">{msg.text}</Typography>
                                        <ClinicCardAI clinics={msg.clinics} />
                                    </Box>
                                )
                                    : <Typography className="ai-message-text">
                                        <ReactMarkdown>{msg.text ?? ''}</ReactMarkdown>
                                    </Typography>
                                }
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
                        <IconButton
                            onClick={handleSend}
                            size="small"
                            className="ai-send-btn">
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
                {open
                    ? <CloseIcon sx={{ fontSize: 20 }} />
                    : <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                }
            </Fab>

        </Box>
    );
}