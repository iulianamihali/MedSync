import { Grid, Box, Typography, Divider } from "@mui/material";

type Props = {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    phoneNumber: string;
    email?: string;
    address?: string;
}
const DetailsTab = (props: Props) => {
    return (
        <Box sx={{ px: 4, mt: 4 }}>

            <Typography
                sx={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#111827",
                    mb: 5
                }}
            >
                Personal Information
            </Typography>

            <Grid container rowSpacing={6} columnSpacing={8}>
                <Grid item xs={12} sm={6} md={3}>
                    <InfoItem label="First Name" value={props.firstName} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <InfoItem label="Last Name" value={props.lastName} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <InfoItem label="Date of Birth" value={props?.dateOfBirth ?? "-"} />
                </Grid>
            </Grid>

            <Divider sx={{ my: 7, borderColor: "#E5E7EB" }} />

            <Typography
                sx={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#111827",
                    mb: 5
                }}
            >
                Contact Information
            </Typography>

            <Grid container rowSpacing={6} columnSpacing={8}>
                <Grid item xs={12} sm={6} md={3}>
                    <InfoItem label="Phone Number" value={props.phoneNumber} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <InfoItem label="Email" value={props?.email ?? "-"} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <InfoItem label="Address" value={props?.address ?? "-"} />
                </Grid>
            </Grid>

        </Box>
    );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <Box>
        <Typography
            sx={{
                fontSize: 14,
                fontWeight: 500,
                color: "#6B7280",
                mb: 1,
                letterSpacing: "0.2px"
            }}
        >
            {label}
        </Typography>

        <Typography
            sx={{
                fontSize: 16,
                fontWeight: 500,
                color: "#1F2937"
            }}
        >
            {value}
        </Typography>
    </Box>
);

export default DetailsTab;
