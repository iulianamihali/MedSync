import { Paper, Stack, Typography, Button, Box } from "@mui/material";
export type Props = {
    actions: {
        id: number;
        title: string;
        buttonText: string;
        icon: React.ReactNode;
        onClickCallBack?: () => void;
    }[];
};

export default function QuickActions(props: Props) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: "#fafafa",
                border: "1px solid #E5E8EC",
            }}
        >
            <Typography variant="h6" fontWeight={700} mb={2}>
                Quick Actions
            </Typography>

            <Stack spacing={1}>
                {props.actions.map((action) => (
                    <Paper
                        key={action.id}
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 4,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            bgcolor: "#fff",
                            border: "1px solid #EEF1F4",
                            boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    bgcolor: "rgba(25,118,210,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {action.icon}
                            </Box>
                            <Typography fontWeight={500}>{action.title}</Typography>
                        </Box>

                        <Button
                            variant="contained"
                            size="small"
                            onClick={()=> action?.onClickCallBack()}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                px: 3,
                                backgroundColor: "#F3F6FB",
                                color: "#1E88E5",
                                fontWeight: 600,
                                boxShadow: "none",
                                "&:hover": {
                                    bgcolor: "#BBDEFB",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            {action.buttonText}
                        </Button>
                    </Paper>
                ))}
            </Stack>
        </Paper>
    );
}
