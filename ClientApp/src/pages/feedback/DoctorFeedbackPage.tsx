import {
    Box,
    Card,
    Typography,
    Rating,
    Stack,
    Avatar,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DateTimeFormat from "../../common/dateTimeUtil";
import {useEffect, useState} from "react";
import type {DoctorFeedbackResponseDto} from "../dashboard/dashboardDoctor/mainGridDoctor/types";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import useAuth from "../../store/features/auth/authHook";
import {CircularProgress} from "@mui/material";
import {getAvatarColor} from "../../common/avatarColorUtil";

const DoctorFeedbackPage = () => {
    const ins = useAuth().user?.ins;
    const doctorId = useAuth().user?.sub;
    const [doctorFeedback, setDoctorFeedback] = useState<DoctorFeedbackResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const getDoctorFeedback = (institutionId: string, doctorId: string) => {
        setLoading(true);
        const url = `${GlobalSettings.doctorRoute}/getDoctorFeedback/${institutionId}/${doctorId}`;
        axiosUtil.get<DoctorFeedbackResponseDto>(url )
            .then (res => {
                setDoctorFeedback(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }

    useEffect(() => {
        if(ins && doctorId)
        {
            getDoctorFeedback(ins, doctorId);
        }
    }, [ins, doctorId]);

    return (
        loading ? <CircularProgress className="circular-progress-main-grid"/>
                :
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: {sm: '100%', md: '1700px'},
                        mt: 7,
                        px: 3,
                        boxSizing: 'border-box',
                        borderRadius: "7px",
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 3,
                        }}
                    >
                        <Typography
                            variant="h6"
                            component="h1"
                            sx={{
                                color: 'text.primary',
                                fontWeight: 500,
                                fontSize: 24
                            }}
                        >
                            Patient Feedback
                        </Typography>
                    </Box>

                    <Card
                        sx={{
                            p: 4,
                            mb: 4,
                            bgcolor: '#FAFAFA'
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={3}>
                            <Typography variant="h1" fontWeight={600} fontSize={64}>
                                {doctorFeedback?.averageRating}
                            </Typography>
                            <Rating value={doctorFeedback?.averageRating ?? 0} readOnly size="large"/>
                            <Typography variant="body2" color="text.secondary">
                                Based on {doctorFeedback?.totalReviews} reviews
                            </Typography>
                        </Stack>
                    </Card>

                    <Box
                        sx={{
                            maxHeight: '440px',
                            overflowY: 'auto',
                            border: '1px solid #e0e0e0',
                            borderRadius: '7px',

                        }}
                    >
                        <Stack spacing={2}>
                            {doctorFeedback?.reviews.map((review) => {
                                return (
                                    <Card key={review.reviewId} sx={{p: 3, '&:hover': {boxShadow: 3}}}>
                                        <Stack direction="row" spacing={2}>
                                            <Avatar
                                                sx={{
                                                    width: 52,
                                                    height: 52,
                                                    bgcolor: getAvatarColor(review.patientFirstName, review.patientLastName).bg,
                                                    color: getAvatarColor(review.patientFirstName, review.patientLastName).color,
                                                    fontWeight: 600
                                                }}
                                            >
                                                {review.patientFirstName.charAt(0)}{review.patientLastName.charAt(0)}
                                            </Avatar>
                                            <Box flex={1}>
                                                <Stack direction="row" justifyContent="space-between"
                                                       alignItems="center" mb={1}>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {review.patientFirstName} {review.patientLastName}
                                                    </Typography>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <StarIcon sx={{fontSize: 18, color: '#FFA726'}}/>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {review.rating}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                                <Typography variant="body2" color="text.secondary" mb={1}>
                                                    {review.comment}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {DateTimeFormat.dayMonthYearTimeFormat(review.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Card>
                                );
                            })}

                        </Stack>
                    </Box>

                </Box>

    );
};

export default DoctorFeedbackPage;