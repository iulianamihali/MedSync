import {Box, Button, Card, Chip, Rating, Stack, Typography} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarIcon from "@mui/icons-material/Star";
import type {DoctorFeedbackResponseDto} from "../dashboard/dashboardDoctor/mainGridDoctor/types";
import {useNavigate} from "react-router-dom";

type Props = {
    doctorFeedback: DoctorFeedbackResponseDto | null;
}
const DoctorFeedbackCard = (props: Props) => {
    const navigate = useNavigate();
    if(!props.doctorFeedback)
        return null;

    return (
        <Card
            sx={{
                borderRadius: "16px",
                p: 2.5,
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                border: "1px solid",
                borderColor: "divider"
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" fontWeight={500} color="text.primary">
                        Patient Feedback
                    </Typography>
                    <Chip
                        label={props.doctorFeedback.totalReviews}
                        size="small"
                        sx={{
                            height: 20,
                            fontSize: "0.688rem",
                            fontWeight: 600,
                            bgcolor: "#F5F5F5",
                            color: "text.secondary"
                        }}
                    />
                </Stack>

                <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                    onClick={() => navigate('/feedback')}
                    sx={{
                        textTransform: "none",
                        fontSize: "0.813rem",
                        fontWeight: 500,
                        color: "text.secondary",
                        minWidth: "auto",
                        "&:hover": {
                            backgroundColor: "transparent",
                            color: "primary.dark",

                        }
                    }}
                >
                    View all
                </Button>
            </Stack>

            <Box
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1.5,
                    bgcolor: "#FFF8E1",
                    mb: 2.5
                }}
            >
                <Typography variant="h6" fontWeight={700} color="text.primary">
                    {props.doctorFeedback.averageRating}
                </Typography>
                <Rating
                    value={props.doctorFeedback.averageRating}
                    precision={0.1}
                    readOnly
                    size="small"
                    sx={{
                        "& .MuiRating-iconFilled": {
                            color: "#FFA726"
                        },
                        "& .MuiRating-icon": {
                            fontSize: "1.1rem"
                        }
                    }}
                />
            </Box>

            <Stack spacing={1.5}>

                {props.doctorFeedback.reviews.map((review) => {
                    return (
                        <Box
                            key={review.reviewId}
                            sx={{
                                p: 1.25,
                                borderRadius: 1.5,
                                bgcolor: "#FAFAFA",
                                border: "1px solid",
                                borderColor: "divider"
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                    {review.patientFirstName} {review.patientLastName}
                                </Typography>

                                <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                                    <StarIcon sx={{fontSize: 14, color: "#FFA726"}}/>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                        {review.rating}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    lineHeight: 1.5
                                }}
                            >
                                {review.comment}
                            </Typography>
                        </Box>
                    );
                })}
            </Stack>
        </Card>
    );

}

export default DoctorFeedbackCard;