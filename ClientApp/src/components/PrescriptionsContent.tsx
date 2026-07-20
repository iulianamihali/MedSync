import { Box, Typography } from "@mui/material";
import type {GetAppointmentPrescriptions} from "./AppointmentCard";
import PrescriptionCard from "./PrescriptionCard";

type Props = {
    prescriptions: GetAppointmentPrescriptions[];
};

const PrescriptionsContent = ({ prescriptions }: Props) => {
    if (!prescriptions || prescriptions.length === 0) {
        return (
            <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography
                    sx={{
                        fontSize: 14,
                        color: "#9CA3AF",
                        fontStyle: "italic",
                    }}
                >
                    No prescriptions issued for this appointment.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            {prescriptions.map((prescription) => (
                <PrescriptionCard
                    prescriptionId={prescription.prescriptionId}
                    diagnosis={prescription.diagnosis}
                    issuedAt={prescription.issuedAt}
                    expirationDate={prescription.expirationDate}
                />
            ))}
        </Box>
    );
};

export default PrescriptionsContent;
