import {
    Box,
    TextField,
    Stack,
    Typography,
    Divider
} from "@mui/material";
import type {EditDataDto} from "./ServicesPage";

type Props = {
    editData: EditDataDto;
    setEditData: (newData: EditDataDto) => void;
}
export default function EditServiceView(props: Props) {
    return (
        <Box sx={{ p: 3, minWidth: 420 }}>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
            >
                Modify the service information below.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
                <TextField
                    disabled
                    value={props.editData?.specialtyName}
                    label="Specialty"
                    fullWidth
                    variant="outlined"
                    InputProps={{
                        sx: {
                            borderRadius: 2,
                            backgroundColor: "background.paper"
                        }
                    }}
                />

                <TextField
                    disabled
                    value={props.editData?.name}
                    label="Service name"
                    fullWidth
                    variant="outlined"
                    InputProps={{
                        sx: {
                            borderRadius: 2
                        }
                    }}
                />

                <Stack direction="row" spacing={2}>
                    <TextField
                        type={"number"}
                        value={props.editData?.price}
                        onChange={(e) => props.setEditData({...props.editData, price: Number(e.target.value)})}
                        label="Price"
                        fullWidth
                        variant="outlined"
                        InputProps={{
                            sx: {
                                borderRadius: 2
                            }
                        }}
                    />

                    <TextField
                        type={"number"}
                        value={props.editData?.duration}
                        onChange={(e) => props.setEditData({...props.editData, duration: Number(e.target.value)})}
                        label="Duration in minutes"
                        fullWidth
                        variant="outlined"
                        InputProps={{
                            sx: {
                                borderRadius: 2
                            }
                        }}
                    />
                </Stack>
            </Stack>
        </Box>
    );
}
