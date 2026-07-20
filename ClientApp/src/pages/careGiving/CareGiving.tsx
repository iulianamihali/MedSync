import React, {useEffect, useState} from "react";
import {Box, Tab, Tabs, Typography} from "@mui/material";
import MuiToolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import CustomPopUp from "../../components/CustomPopUp";
import AddPersonForm from "./addPersonForm/AddPersonForm";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import useAuth from "../../store/features/auth/authHook";
import FutureAppointments from "../dashboard/dashboardPatient/mainGrid/futureApp/FutureAppointments";
import {useNavigate} from "react-router-dom";
import AppointmentHistory from "../patients/components/appHistory/AppointmentHistory";

type PersonsInCare = {
    careUnregisteredPatientId: string;
    name: string;
}
enum DrawerTab {
    FutureAppointments = "futureAppointments",
    Record = "record",
}
export type BookingFor = {
    careUnregisteredPatientId: string;
    name: string;
} | null;

const Caregiving: React.FC = () => {
    const patientId = useAuth()?.user?.sub;
    const [activeTab, setActiveTab] = useState<DrawerTab>(DrawerTab.FutureAppointments);
    const [addPerson, setAddPerson] = useState<boolean>(false);
    const [personsInCare, setPersonsInCare] = useState<PersonsInCare[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<PersonsInCare | null>(null);
    const navigate = useNavigate();

    const getPersonsInCare = (patientId: string) => {
        const url = `${GlobalSettings.careGiving}/persons-in-care/${patientId}`;
        axiosUtil.get<PersonsInCare[]>(url)
            .then (res => {
                setPersonsInCare(res.data);
                if(res.data.length > 0)
                    setSelectedPerson(res.data[0]);
            })
            .catch(err => {
                console.error(err);
            })
    }
    useEffect(() => {
        if(patientId)
            getPersonsInCare(patientId);
    }, [patientId]);

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: { sm: "100%", md: "1700px" },
                padding: { xs: 2, md: 3 },
                overflow: "hidden",
                height: "90vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <MuiToolbar disableGutters sx={{ flexShrink: 0 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, pr: 2, flexWrap: "wrap" }}>
                <Typography
                    variant="h6"
                    component="h1"
                    sx={{ color: "text.primary", fontWeight: 500, fontSize: { xs: 20, sm: 24 } }}
                >
                    People in my care
                </Typography>
                <Button
                    onClick={() => setAddPerson(true)}
                    startIcon={<PersonAddAltIcon sx={{ fontSize: 16 }} />}
                    sx={{
                        textTransform: "none",
                        fontSize: { xs: "0.72rem", sm: "0.78rem" },
                        fontWeight: 500,
                        color: "#1565c0",
                        border: "1px solid #90caf9",
                        borderRadius: "99px",
                        padding: { xs: "4px 12px", sm: "6px 16px" },
                        background: "#e3f2fd",
                        "&:hover": {
                            background: "#bbdefb",
                            borderColor: "#1565c0",
                        }
                    }}
                >
                    Add person
                </Button>

                <Autocomplete
                    options={personsInCare ? personsInCare : []}
                    value={selectedPerson}
                    onChange={(_, newValue) => setSelectedPerson(newValue)}
                    getOptionLabel={(option) => option.name}
                    sx={{
                        ml: { xs: 0, sm: "auto" },
                        mr: { xs: 0, sm: 2 },
                        width: { xs: "100%", sm: 230 },
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            fontSize: "0.9rem",
                            background: "#fafafa",
                            "& fieldset": {
                                borderColor: "#e0e0e0",
                            },
                            "&:hover fieldset": {
                                borderColor: "#90caf9",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#1565c0",
                                borderWidth: "1.5px",
                            },
                        },
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Select a person..."
                            variant="outlined"
                            size="small"
                        />
                    )}
                />
            </Box>
            <CustomPopUp open={addPerson}
                         setOpen={setAddPerson}
                         title={"Add person details"}
                         contentComponent={AddPersonForm}
                         showActions={false}
            />
            {selectedPerson && (
                <>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            px: 3,
                            py: 2.5,
                            mt: 1,
                            mb: 0,
                            mr: { xs: 0, sm: 2 },
                            borderRadius: "16px 16px 0 0",
                            background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
                            boxShadow: "0 -2px 10px rgba(0,0,0,0.03)",
                            border: "1px solid rgba(21, 101, 192, 0.1)",
                            borderBottom: "none",
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: 600,
                                fontSize: "1.1rem",
                                flexShrink: 0,
                                boxShadow: "0 4px 10px rgba(21, 101, 192, 0.3)",
                            }}
                        >
                            {selectedPerson.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#1a1a1a" }}>
                                {selectedPerson.name}
                            </Typography>
                            <Typography sx={{ fontSize: "0.75rem", color: "#1565c0", fontWeight: 500 }}>
                                Currently managing care
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Button
                                onClick={() => {
                                    navigate("/map", {
                                        state: {
                                            careUnregisteredPatientId: selectedPerson?.careUnregisteredPatientId,
                                            name: selectedPerson?.name,
                                        }
                                    })
                                }}
                                sx={{
                                    textTransform: "none",
                                    fontSize: "0.78rem",
                                    fontWeight: 500,
                                    color: "#1565c0",
                                    border: "1px solid #90caf9",
                                    borderRadius: "99px",
                                    padding: "4px 16px",
                                    background: "#e3f2fd",
                                    whiteSpace: "nowrap",
                                    "&:hover": {
                                        background: "#bbdefb",
                                        borderColor: "#1565c0",
                                    }
                                }}
                            >
                                Book appointment
                            </Button>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: "#4caf50",
                                    boxShadow: "0 0 0 3px rgba(76, 175, 80, 0.2)",
                                }}
                            />
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            mr: { xs: 3, sm: 5 },
                            borderLeft: "1px solid rgba(21, 101, 192, 0.1)",
                            borderRight: "1px solid rgba(21, 101, 192, 0.1)",
                            borderBottom: "1px solid rgba(21, 101, 192, 0.1)",
                            borderRadius: "0 0 16px 16px",
                            background: "#fff",
                            mb: 3,
                        }}
                    >
                        <Tabs
                            value={activeTab}
                            onChange={(_, val) => setActiveTab(val)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                px: 1,
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontWeight: 500,
                                    fontSize: "0.85rem",
                                    color: "text.secondary",
                                    minHeight: 48,
                                    "&.Mui-selected": {
                                        color: "#1565c0",
                                        fontWeight: 600,
                                    },
                                },
                                "& .MuiTabs-indicator": {
                                    backgroundColor: "#1565c0",
                                    height: 3,
                                    borderRadius: "3px 3px 0 0",
                                },
                            }}
                        >
                            <Tab label="Future Appointments" value={DrawerTab.FutureAppointments} />
                            <Tab label="Medical Record" value={DrawerTab.Record} />

                        </Tabs>
                    </Box>
                </>
            )}

            <Box sx={{ flex: 1, px: { xs: 1, md: 2 },overflowY: "auto" }}>
                {activeTab === DrawerTab.FutureAppointments && (
                    <FutureAppointments careUnregisteredPatientId={selectedPerson?.careUnregisteredPatientId} />
                )}
                {activeTab === DrawerTab.Record && (
                    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                        <AppointmentHistory careUnregisteredPatientId={selectedPerson?.careUnregisteredPatientId} />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Caregiving;