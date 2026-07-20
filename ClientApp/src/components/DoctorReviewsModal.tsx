import './styles/DoctorReviewsModal.scss';
import {
    Box,
    Card,
    Typography,
    Rating,
    Stack,
    Avatar,
    CircularProgress
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useEffect, useState } from 'react';
import GlobalSettings from '../GlobalSettings.json';
import axiosUtil from '../common/axiosUtil';
import { getAvatarColor } from '../common/avatarColorUtil';
import DateTimeFormat from '../common/dateTimeUtil';

import type {DoctorFeedbackResponseDto} from "../pages/dashboard/dashboardDoctor/mainGridDoctor/types";

type Props = {
    doctorId: string;
    institutionId: string;
}

const DoctorReviewsModal = (props: Props) => {
    const [feedback, setFeedback] = useState<DoctorFeedbackResponseDto | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const url = `${GlobalSettings.doctorRoute}/getDoctorFeedback/${props.institutionId}/${props.doctorId}`;
        axiosUtil.get<DoctorFeedbackResponseDto>(url)
            .then(res => setFeedback(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [props.doctorId, props.institutionId]);

    if (loading) {
        return (
            <Box className="doctor-reviews-modal__loading">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="doctor-reviews-modal">
            <Card className="doctor-reviews-modal__summary-card" elevation={0}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography className="doctor-reviews-modal__summary-card__rating-number">
                        {feedback?.averageRating}
                    </Typography>
                    <Rating value={feedback?.averageRating ?? 0} readOnly />
                    <Typography className="doctor-reviews-modal__summary-card__reviews-count">
                        Based on {feedback?.totalReviews} reviews
                    </Typography>
                </Stack>
            </Card>

            <Box className="doctor-reviews-modal__list">
                {feedback?.reviews.map((review) => {
                    const avatarColor = getAvatarColor(review.patientFirstName, review.patientLastName);
                    return (
                        <Card key={review.reviewId} className="doctor-reviews-modal__review-card" elevation={1}>
                            <Stack direction="row" spacing={2}>
                                <Avatar
                                    className="doctor-reviews-modal__review-card__avatar"
                                    sx={{ bgcolor: avatarColor.bg, color: avatarColor.color }}
                                >
                                    {review.patientFirstName.charAt(0)}{review.patientLastName.charAt(0)}
                                </Avatar>
                                <Box className="doctor-reviews-modal__review-card__content">
                                    <Box className="doctor-reviews-modal__review-card__header">
                                        <Typography className="doctor-reviews-modal__review-card__name">
                                            {review.patientFirstName} {review.patientLastName}
                                        </Typography>
                                        <Box className="doctor-reviews-modal__review-card__rating">
                                            <StarIcon className="doctor-reviews-modal__review-card__rating__icon" />
                                            <Typography className="doctor-reviews-modal__review-card__rating__value">
                                                {review.rating}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography className="doctor-reviews-modal__review-card__comment">
                                        {review.comment}
                                    </Typography>
                                    <Typography className="doctor-reviews-modal__review-card__date">
                                        {DateTimeFormat.dayMonthYearTimeFormat(review.createdAt)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
};

export default DoctorReviewsModal;