import {
    Typography, Box, TextField, Button, Card, Divider, Stack, Avatar
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {useEffect, useMemo, useState} from "react";
import axiosUtil from "../../../common/axiosUtil";
import GlobalSettings from "../../../GlobalSettings.json";
import type {PatientBasicInfo} from "./ReferralModal";

export type Medication = {
    medicationName: string | null;
    strength: string | null;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
}

export type AddPrescription = {
    appointmentId: string | null;
    diagnosis: string | null;
    medications: Medication[];
}

type Props = {
    addMedicationsB: AddPrescription;
    setAddMedicationsB: (obj: AddPrescription) => void;
}

export default function PrescriptionModal(props: Props) {
    const [patientBasicInfo, setPatientBasicInfo] = useState<PatientBasicInfo>();

    const getPatientBasicInfo = (appointmentId: string) => {
        const url = `${GlobalSettings.appointmentRoute}/getPatientBasicInfo/${appointmentId}`;
        axiosUtil.get<PatientBasicInfo>(url)
            .then (res => {
                setPatientBasicInfo(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }
    useEffect(() => {
        if(props.addMedicationsB.appointmentId)
        {
            getPatientBasicInfo(props.addMedicationsB.appointmentId);
        }
    }, [props.addMedicationsB.appointmentId]);

    const handleChangeDataMedications = (index: number, value: string, prop: keyof Medication) => {
        if (!props.addMedicationsB || !props.addMedicationsB.medications) {
            return;
        }

        const copieArray = [...props.addMedicationsB.medications];
        for (let i = 0; i < copieArray.length; i++) {
            if (i === index) {
                copieArray[i][prop] = value;
                break;
            }
        }
        props.setAddMedicationsB({...props.addMedicationsB, medications: copieArray});
    }

    const addMedication = () => {
        const newMedication: Medication = {
            medicationName: null,
            strength: null,
            dosage: null,
            frequency: null,
            duration: null,
        };
        const copyMedications = {
            ...props.addMedicationsB, medications: [
                ...props.addMedicationsB.medications, newMedication
            ]
        }
        props.setAddMedicationsB(copyMedications);
    }

    const deactivateAddMedication = useMemo(() => {
        if (!props.addMedicationsB?.medications)
            return true;
        for (let i = 0; i < props.addMedicationsB.medications.length; i++) {
            if (!props.addMedicationsB.medications[i].medicationName ||
                !props.addMedicationsB.medications[i].strength ||
                !props.addMedicationsB.medications[i].dosage ||
                !props.addMedicationsB.medications[i].duration)
                return true;
        }
        return false;
    }, [props.addMedicationsB?.medications])

    const deleteMedication = (indexParam: number) => {
        if (indexParam === 0)
            return;
        const newArray = props.addMedicationsB.medications.filter((_, index) => index !== indexParam);
        props.setAddMedicationsB({...props.addMedicationsB, medications: newArray});
    }
        return (
            <Box sx={{p: 2}}>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        mb: 3,
                        borderRadius: 2,
                        backgroundColor: "#f5f7fa"
                    }}
                >
                    <Avatar sx={{bgcolor: "#a8c9e8", width: 40, height: 40}}>
                        I
                    </Avatar>

                    <Box>
                        <Typography variant="body1" fontWeight={600}>
                            {patientBasicInfo?.fullName}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {patientBasicInfo?.dateOfBirth}
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Diagnosis</Typography>
                <Stack direction="row" spacing={1.5}>
                    <TextField fullWidth size="small" label="Diagnosis Name" value={props.addMedicationsB.diagnosis} onChange={(e) => props.setAddMedicationsB({...props.addMedicationsB, diagnosis: e.target.value})} />
                </Stack>

                <Divider sx={{my: 2}}/>

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Typography variant="subtitle2" fontWeight={600}>
                        Medication
                    </Typography>

                    <Button
                        disabled={deactivateAddMedication}
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon/>}
                        onClick={addMedication}
                    >
                        Add Medication
                    </Button>
                </Stack>

                {props.addMedicationsB.medications.map((medication, index) => {
                    return (
                        <Card
                            sx={{
                                p: 2.5,
                                mb: 2,
                                border: "1px solid",
                                borderColor: "grey.200",
                                borderRadius: 2
                            }}
                        >
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >
                                <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color="text.secondary"
                                >
                                    {index + 1}
                                </Typography>

                                <DeleteOutlineIcon
                                    fontSize="small"
                                    color="error"
                                    sx={{cursor: "pointer"}}
                                    onClick={() => deleteMedication(index)}
                                />
                            </Stack>

                            <Stack spacing={2}>
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Medication Name"
                                        value={medication.medicationName}
                                        onChange={(e) => handleChangeDataMedications(index, e.target.value, "medicationName")}

                                    />

                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Strength (e.g. 500 mg)"
                                        value={medication.strength}
                                        onChange={(e) => handleChangeDataMedications(index, e.target.value, "strength")}

                                    />

                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Dosage (e.g. 1 tablet)"
                                        onChange={(e) => handleChangeDataMedications(index, e.target.value, "dosage")}
                                    />


                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Frequency (e.g. 2 times/day)"
                                        value={medication.frequency}
                                        onChange={(e) => handleChangeDataMedications(index, e.target.value, "frequency")}
                                    />


                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Duration (e.g. 7 days)"
                                        value={medication.duration}
                                        onChange={(e) => handleChangeDataMedications(index, e.target.value, "duration")}

                                    />

                                </Stack>

                            </Stack>
                        </Card>
                    );
                })}
            </Box>
        );
    }
