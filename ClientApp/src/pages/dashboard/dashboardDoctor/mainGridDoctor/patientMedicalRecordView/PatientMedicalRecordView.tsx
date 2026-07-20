import {
    Box,
    Typography,
    TextField,
    IconButton, Button, MenuItem
} from "@mui/material";
import {useEffect, useState} from "react";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import Divider from "@mui/material/Divider";
import GlobalSettings from "../../../../../GlobalSettings.json";
import axiosUtil from "../../../../../common/axiosUtil";
import AppointmentStatusEnumType, {appointmentStatusTransitions, appointmentStatusValues} from "../../../../../enums/AppointmentStatusEnumType";
import Select from "@mui/material/Select";

type Props = {
    appointmentId: string;
    updateStatusCallback: (appointmentId: string, status: AppointmentStatusEnumType) => void;
}

export type MedicalRecord = {
    appointmentId: string,
    patientName: string,
    cnp: string,
    dateOfBirth: string,
    age: number,
    investigation: string,
    investigationResult: string,
    recommendations: string,
    symptoms: string,
    diagnosis: string,
    appointmentStatus: AppointmentStatusEnumType,
}

export default function PatientMedicalRecordView(props: Props) {
    const [edit, setEdit] = useState(false);
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<AppointmentStatusEnumType>();

    const allowedStatuses =
        appointmentStatusTransitions[medicalRecord?.appointmentStatus] ?? [];
    const statusItem = appointmentStatusValues.find(
        x => x.id === selectedStatus
    );
    const dropdownStatuses = [
        medicalRecord?.appointmentStatus,
        ...allowedStatuses
    ];

    useEffect(() => {
        if(medicalRecord)
            setSelectedStatus(medicalRecord?.appointmentStatus)
    }, [medicalRecord]);

    const getMedicalRecord = (appointmentId: string) => {
        const url = `${GlobalSettings.medicalRecords}/getMedicalRecordByAppointment/${appointmentId}`;
        axiosUtil.get<MedicalRecord>(url)
            .then (res => {
                setMedicalRecord(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }

    useEffect(() => {
        if(props.appointmentId)
            getMedicalRecord(props.appointmentId);
    }, [props.appointmentId]);

    const editMedicalRecord = () => {
        const url = `${GlobalSettings.medicalRecords}/editMedicalRecord`;
        const req = {
            appointmentId: medicalRecord?.appointmentId,
            investigation: medicalRecord?.investigation,
            investigationResult: medicalRecord?.investigationResult,
            recommendations: medicalRecord?.recommendations,
            symptoms: medicalRecord?.symptoms,
            diagnosis: medicalRecord?.diagnosis,
            appointmentStatus: selectedStatus,
        }
        axiosUtil.post<MedicalRecord>(url, req)
            .then (res => {
                getMedicalRecord(props.appointmentId);
                setEdit(false);
                setSelectedStatus(res.data.appointmentStatus);
                if(props.updateStatusCallback && selectedStatus)
                    props.updateStatusCallback(props.appointmentId, selectedStatus);
            })
            .catch(err => {
                console.error(err);
            })
    }

    const medicalField = {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        "& fieldset": {
            borderColor: edit ? "#CBD5E1" : "transparent"
        },
        "&:hover fieldset": {
            borderColor: edit ? "#94A3B8" : "transparent"
        },
        "& input, & textarea": {
            padding: "10px 12px",
            fontSize: 15,
            lineHeight: 1.55
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: "#F8FAFC", height: "100%" }}>

            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
            >
                <Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <PersonOutlineIcon color="primary" />
                        <Typography fontSize={22} fontWeight={600}>
                            {medicalRecord?.patientName}
                        </Typography>
                    </Box>

                    <Box
                        display="flex"
                        alignItems="center"
                        gap={2}
                        mt={1}
                    >
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <BadgeOutlinedIcon fontSize="small" sx={{ opacity: 0.6 }} />
                            <Typography fontSize={13} color="text.secondary">
                                {medicalRecord?.cnp}
                            </Typography>
                        </Box>
                        {medicalRecord?.dateOfBirth ?
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <CalendarMonthOutlinedIcon fontSize="small" sx={{ opacity: 0.6 }} />
                            <Typography fontSize={13} color="text.secondary">
                                {medicalRecord?.dateOfBirth} · {medicalRecord?.age}
                            </Typography>
                        </Box>
                         : ""}
                    </Box>
                </Box>

                <IconButton
                    onClick={() => setEdit(!edit)}
                    sx={{
                        bgcolor: "rgba(237,197,149,0.15)",
                        borderRadius: "8px",
                        "&:hover": {
                            bgcolor: "rgba(237,197,149,0.25)"
                        }
                    }}
                >
                    {edit ? <CheckOutlinedIcon /> : <EditOutlinedIcon />}
                </IconButton>

            </Box>
            <Divider
                sx={{
                    my: 2,
                    borderColor: "rgba(237, 197, 149, 0.6)"
                }}
            />

            <Box display="flex" gap={2}>

                <Box flex={1.4} display="flex" flexDirection="column" gap={2}>
                    <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Typography fontSize={16} fontWeight={600}>
                                Investigation
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            defaultValue={medicalRecord?.investigation}
                            onChange={(e) => setMedicalRecord(prev => prev ? {...prev, investigation: e.target.value} : null)}
                            InputProps={{ readOnly: !edit }}
                            sx={medicalField}
                        />
                    </Box>

                    <Box>
                        <Typography fontSize={16} fontWeight={600} mb={0.5}>
                            Investigation result
                        </Typography>

                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            multiline
                            defaultValue={medicalRecord?.investigationResult}
                            onChange={(e) => setMedicalRecord(prev => prev ? {...prev, investigationResult: e.target.value} : null)}
                            InputProps={{ readOnly: !edit }}
                            sx={medicalField}
                        />
                    </Box>

                    <Box>
                        <Typography fontSize={16} fontWeight={600} mb={0.5}>
                            Recommendations
                        </Typography>

                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            multiline
                            defaultValue={medicalRecord?.recommendations}
                            onChange={(e) => setMedicalRecord(prev => prev ? {...prev, recommendations: e.target.value} : null)}
                            InputProps={{ readOnly: !edit }}
                            sx={medicalField}
                        />
                    </Box>
                </Box>

                <Box flex={1} display="flex" flexDirection="column" gap={2}>
                    <Box>
                        <Typography fontSize={16} fontWeight={600} mb={0.5}>
                            Symptoms
                        </Typography>

                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            defaultValue={medicalRecord?.symptoms}
                            onChange={(e) => setMedicalRecord(prev => prev ? {...prev, symptoms: e.target.value} : null)}
                            InputProps={{ readOnly: !edit }}
                            sx={medicalField}
                        />
                    </Box>

                    <Box>
                        <Typography fontSize={16} fontWeight={600} mb={0.5}>
                            Diagnosis
                        </Typography>

                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            defaultValue={medicalRecord?.diagnosis}
                            onChange={(e) => setMedicalRecord(prev => prev ? {...prev, diagnosis: e.target.value} : null)}
                            InputProps={{ readOnly: !edit }}
                            sx={medicalField}
                        />
                    </Box>
                </Box>

            </Box>
            <Divider
                sx={{
                    my: 2,
                    borderColor: "rgba(237, 197, 149, 0.6)"
                }}
            />

            <Typography fontSize={16} fontWeight={600} mb={0.5}>
                Status appointment
            </Typography>
            <Select
                // disabled={!medicalRecord?.appointmentStatus === AppointmentStatusEnumType.Completed || medicalRecord?.appointmentStatus === AppointmentStatusEnumType.Canceled || medicalRecord?.appointmentStatus === AppointmentStatusEnumType.Missed}
                value={selectedStatus ?? ''}
                renderValue={() => statusItem?.text ?? ''}
                onChange={(e) => setSelectedStatus(Number(e.target.value))}

                disabled={!edit}
                sx={{
                    color: statusItem?.style.color,
                    borderRadius: 2,
                }}

            >
                {appointmentStatusValues
                    .filter(s => dropdownStatuses.includes(s.id))
                    .map(s => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.text}
                        </MenuItem>
                    ))}

            </Select>

            <Box
                position="absolute"
                bottom={24}
                right={24}
            >
                <Button disabled={!edit} onClick={editMedicalRecord} variant="contained" sx={{ bgcolor: 'rgba(109,156,188,1)' }}>
                    Save
                </Button>
            </Box>
        </Box>
    );
}
