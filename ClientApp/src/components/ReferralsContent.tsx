import { Box, Typography } from "@mui/material";
import ReferralCard from "./ReferralCard";
import type {GetAppointmentReferrals} from "./AppointmentCard";

type Props = {
    referrals: GetAppointmentReferrals[];
};

const ReferralsContent = ({ referrals }: Props) => {
    if (!referrals || referrals.length === 0) {
        return (
            <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography
                    sx={{
                        fontSize: 14,
                        color: "#9CA3AF",
                        fontStyle: "italic",
                    }}
                >
                    No referrals issued for this appointment.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            {referrals.map((referral) => (
                <ReferralCard
                    medicalReferralId={referral.medicalReferralId}
                    specialtyName={referral.specialtyName}
                    issuedAt={referral.issuedAt}
                    expirationDate={referral.expirationDate}
                    suspectedDiagnosis={referral.suspectedDiagnosis}
                />
            ))}
        </Box>
    );
};

export default ReferralsContent;
