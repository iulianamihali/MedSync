import { Stack, Typography, Button, Box } from "@mui/material";
import DateTimeFormat from "../../../../../../common/dateTimeUtil";
import type {SelectedSlot} from "../CreateAppointmentView";
type Slot = {
    start: string;
    end: string;
};

type Props = {
    name: string;
    specialtyName?: string;
    serviceName?: string;
    slots: Slot[];
    selectedSlot: SelectedSlot | null;
    onClickCallBack: (startTime: string) => void;
    doctorId: string;
};

export default function DoctorAvailabilityCard({ name, specialtyName, serviceName, slots, selectedSlot, onClickCallBack, doctorId }: Props) {

    return (
        <Box
            sx={{
                position: "relative",
                borderRadius: 2,
                border: "1px solid #e5e7eb",
                bgcolor: selectedSlot?.doctorId === doctorId ? "#dbe5f4" : "ffff",
                p: 2,
                transition: "all 0.2s ease",
                cursor: "default",
                "&:hover": {
                    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                    transform: "translateY(-2px)",
                },
                "&:before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    borderRadius: "4px 0 0 4px",
                    bgcolor: "#2563eb",
                },
            }}
        >
            <Stack spacing={1.5} pl={1}>
                {/* HEADER */}
                <Stack spacing={0.2}>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, lineHeight: 1.2 }}
                    >
                        Dr. {name}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                        }}
                    >
                        {specialtyName} • {serviceName}
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{ color: "#64748b" }}
                    >
                        Available today
                    </Typography>
                </Stack>

                {/* SLOTURI */}
                {slots.length === 0 ? (
                    <Typography
                        variant="body2"
                        sx={{ color: "#94a3b8" }}
                    >
                        No available slots
                    </Typography>
                ) : (

                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        columnGap={1}
                        rowGap={1}
                    >
                        {slots.map((slot, index) => (
                            <Button
                                variant={
                                    selectedSlot?.doctorId === doctorId &&
                                    selectedSlot?.startTime === slot.start
                                        ? "contained"
                                        : "outlined"
                                }

                                key={index}
                                size="small"
                                onClick={() => onClickCallBack(slot.start)}
                                sx={{
                                    height: 30,
                                    minWidth: 68,
                                    px: 1,
                                    borderRadius: 1.5,
                                    fontSize: 12.5,
                                    fontWeight: 500,
                                    textTransform: "none",
                                    // color: "#2563eb",
                                    borderColor: "#dbeafe",
                                }}
                            >
                                {DateTimeFormat.timeFormat(slot.start)}
                            </Button>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Box>
    );
}
