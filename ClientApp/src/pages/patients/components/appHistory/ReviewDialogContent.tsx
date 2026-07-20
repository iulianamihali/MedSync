import { Box, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import Rating from "@mui/material/Rating";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

export type ReviewDialogContentProps = {
    rating: number | null;
    comment: string;
    onRatingChange: (value: number | null) => void;
    onCommentChange: (value: string) => void;
};

const ReviewDialogContent = ({
    rating,
    comment,
    onRatingChange,
    onCommentChange,
}: ReviewDialogContentProps) => {
    return (
        <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography sx={{ fontSize: "0.9rem", color: "#1a2e35", textAlign: "center" }}>
                How was your experience with the doctor?
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Rating
                    value={rating}
                    onChange={(_, newValue) => onRatingChange(newValue)}
                    size="large"
                    icon={<StarRoundedIcon sx={{ fontSize: 42 }} />}
                    emptyIcon={<StarRoundedIcon sx={{ fontSize: 42, color: "#e0ebe7" }} />}
                    sx={{ color: "#f5a623" }}
                />
            </Box>

            <TextField
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                placeholder="Share your experience (optional)"
                multiline
                rows={3}
                slotProps={{ htmlInput: { maxLength: 1000 } }}
                helperText={`${comment.length} / 1000`}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        fontSize: "0.85rem",
                        borderRadius: "8px",
                    },
                    "& .MuiFormHelperText-root": {
                        textAlign: "right",
                        fontSize: "0.7rem",
                        color: "#90a4ae",
                        marginRight: 0,
                    },
                }}
            />
        </Box>
    );
};

export default ReviewDialogContent;

