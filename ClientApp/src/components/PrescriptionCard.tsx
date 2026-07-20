import { Box, Typography, Paper, Button } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DateTimeFormat from "../common/dateTimeUtil";
import GlobalSettings from "../GlobalSettings.json";
import axiosUtil from "../common/axiosUtil";

type Props = {
    prescriptionId: string;
    diagnosis: string;
    issuedAt: string;
    expirationDate: string;
}

const PrescriptionCard = (props: Props) => {

    const getMedicalPrescriptionPdf = (medicalPrescriptionId: string) => {
        const url = `${GlobalSettings.medicalPrescription}/getMedicalPrescriptionPdf/${medicalPrescriptionId}`;
        axiosUtil.get(url, {responseType: "blob",})
            .then(res => {
                const blob = new Blob([res.data], {type: "application/pdf"});
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = "MedicalPrescription.pdf";
                document.body.appendChild(a);
                a.click();

                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(err => {
                console.error(err);
            })
    }

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3,
                mb: 2,
                border: "1px solid #E1BEE7",
                background: "#FFFFFF",
                transition: "all 0.25s ease",
                position: "relative",
                overflow: "hidden",

                "&:before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "5px",
                    height: "100%",
                    background: "linear-gradient(180deg, #7B1FA2, #CE93D8)",
                },

                "&:hover": {
                    boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
                    transform: "translateY(-3px)",
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                }}
            >

                <Box sx={{ mb: 1.5, mt: 1.2 }}>
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "#4B5563",
                            mb: 0.5,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                        }}
                    >
                        Diagnosis
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 17,
                            fontWeight: 600,
                            color: "#1F2937",
                        }}
                    >
                        {props?.diagnosis || "—"}
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        fontWeight: 500,
                    }}
                >
                    Issued:{" "}
                    {DateTimeFormat.dayMonthYearTimeFormat(props?.issuedAt)}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pt: 2,
                    borderTop: "1px solid #F3F4F6",
                }}
            >
                <Typography
                    sx={{
                        fontSize: 13,
                        color: "#6B7280",
                        fontWeight: 500,
                    }}
                >
                    Valid until:{" "}
                    {DateTimeFormat.dayMonthYearTimeFormat(
                        props?.expirationDate
                    )}
                </Typography>

                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadOutlinedIcon />}
                    onClick={() => {
                        if (props?.prescriptionId)
                            getMedicalPrescriptionPdf(
                                props?.prescriptionId
                            );
                    }}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 13,
                        px: 2.5,
                        py: 0.8,
                        borderColor: "#BBDEFB",
                        color: "#1565C0",
                        backgroundColor: "#F0F9FF",

                        "&:hover": {
                            backgroundColor: "#E3F2FD",
                            borderColor: "#90CAF9",
                        },
                    }}
                >
                    Export PDF
                </Button>
            </Box>
        </Paper>
    );

};

export default PrescriptionCard;
