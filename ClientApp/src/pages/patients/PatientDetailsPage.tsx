import './PatientDetailsPage.scss';
import useAuth from "../../store/features/auth/authHook";
import { useParams } from "react-router-dom";
import {IconButton, Tab, Tabs, Typography} from "@mui/material";
import {Box} from "@mui/system";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PatientHeader from "./components/PatientHeader";
import {useEffect, useState} from "react";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import {calculateAge} from "../../utils/calculateAge";
import Divider from "@mui/material/Divider";
import DetailsTab from "./components/DetailsTab";
import AppointmentsTab from "./components/AppointmentsTab";
import type AppointmentStatusEnumType from "../../enums/AppointmentStatusEnumType";

export type Patient = {
    id: string,
    firstName: string;
    lastName: string;
    dateOfBirth?: string,
    address?: string,
    phoneNumber: string,
    email?: string,
}

export type AppointmentSummary = {
    medicalRecordId: string,
    appointmentId: string;
    date: string;
    status: AppointmentStatusEnumType;
    service: string;
    diagnosis: string;
}

const PatientDetailsPage = () => {
    const auth = useAuth();
    const doctorId = auth?.user?.sub;
    const ins = auth.user?.ins;
    const {patientId} = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [tab, setTab] = useState(0);
    const [appointmentsSummary, setAppointmentsSummary] = useState<AppointmentSummary[]>([]);

    const fetchPatient = (patientId: string) => {
        const url = `${GlobalSettings.patientRoute}/getPatientDetails/${patientId}`;
        axiosUtil.get<Patient>(url)
            .then(res => {
                setPatient(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }
    useEffect(() => {
        if (patientId)
            fetchPatient(patientId);
    }, [patientId]);


    const fetchAppointmentsSummary = (institutionId: string, doctorId: string, patientId: string) => {
        const url = `${GlobalSettings.patientRoute}/getPatientAppointmentsSummary/${institutionId}/${doctorId}/${patientId}`;
        axiosUtil.get<AppointmentSummary[]>(url)
            .then (res => {
                setAppointmentsSummary(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }

    useEffect(() => {
        if(ins && doctorId && patientId)
            fetchAppointmentsSummary(ins, doctorId, patientId);
    }, [ins,doctorId, patientId]);

    const updateStatusCallback = (appointmentId: string, status: AppointmentStatusEnumType) => {
        const tempData = [...appointmentsSummary];
        for(let i = 0; i < appointmentsSummary.length; i++) {
            if(appointmentsSummary[i].appointmentId === appointmentId)
            {
                appointmentsSummary[i].status = status;
                break;
            }
        }
        setAppointmentsSummary(tempData);
    }

    if (!patient)
        return null;
    return(
        <Box>
            <Box sx={{ mt: 7, px: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton onClick={() => navigate("/patients")}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 500
                    }}
                >
                    Patient Details
                </Typography>

            </Box>

            <PatientHeader
                firstName={patient?.firstName}
                lastName={patient?.lastName}
                age={patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 0}
            />

            <Tabs sx={{marginLeft:2 }} value={tab} onChange={(_, newValue) => setTab(newValue)}>
                <Tab label="Details" />
                <Tab label="Appointments" />
            </Tabs>
            <Divider />
            {tab === 0 && <DetailsTab firstName={patient.firstName}
                                      lastName={patient.lastName}
                                      dateOfBirth={patient?.dateOfBirth}
                                      phoneNumber={patient.phoneNumber}
                                      email={patient.email}
                                      address={patient.address}
            /> ||
                tab === 1 && <AppointmentsTab appointmentsSummary={appointmentsSummary}
                                              updateStatusCallback={updateStatusCallback}
                />
            }

        </Box>

    );
}

export default PatientDetailsPage;