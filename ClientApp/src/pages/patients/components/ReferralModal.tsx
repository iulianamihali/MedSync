import {
    DialogContent,
    TextField,
    MenuItem,
    Typography,
    Stack, Avatar, Autocomplete
} from "@mui/material";
import {useEffect, useState} from "react";
import GlobalSettings from "../../../GlobalSettings.json";
import axiosUtil from "../../../common/axiosUtil";
import {Box} from "@mui/system";
import type {SelectOptionDto} from "../../services/AddSpecialtyServicesView";

type Props = {
    appointmentId: string;
    referralFields: ReferralInfo;
    setReferralFields: (referralInfo: ReferralInfo) => void;
    // updateStatusCallback: (appointmentId: string, status: AppointmentStatusEnumType) => void;
}
export type PatientBasicInfo = {
    id: string;
    fullName: string;
    dateOfBirth: string;
}
export type ReferralInfo = {
    specialtyId: string | null;
    appointmentId: string | null;
    reasonReferral: string | null;
    suspectedDiagnosis: string | null;
    relevantClinicalInformation: string | null;
    validityInDays: number | null;

}
export default function ReferralModal(props: Props) {
    const [patientBasicInfo, setPatientBasicInfo] = useState<PatientBasicInfo>();
    const [specialties, setSpecialties] = useState<SelectOptionDto[]>([]);
    const validity = [30, 60, 90];

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

    const getSpecialties = () => {
        const url = `${GlobalSettings.globalDataRoute}/getSpecialties`;
        axiosUtil.get<SelectOptionDto[]>(url)
            .then (res => {
                setSpecialties(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }

    useEffect(() => {
        if(props.appointmentId)
        {
            getPatientBasicInfo(props.appointmentId);
            getSpecialties();
        }
    }, [props.appointmentId]);

    return (
        <>
            <DialogContent sx={{ px: 5, py: 4 }}>
                <Stack spacing={3}>

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
                        <Avatar sx={{ bgcolor: "#a8c9e8", width: 40, height: 40 }}>
                            {patientBasicInfo?.fullName?.charAt(0)}
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

                    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
                        Referral destination
                    </Typography>

                    <Autocomplete
                        disableClearable
                        value={specialties.find((x) => x.id === props.referralFields?.specialtyId)}
                        onChange={(_, newValue) => {
                            if(props.referralFields)
                            {
                                // setReferralFields((prev: ReferralInfo) => {
                                //     return {
                                //         ...prev,
                                //         specialtyId: newValue.id as string,
                                //     }
                                // });
                                props.setReferralFields({
                                    ...props.referralFields,
                                    specialtyId: newValue.id as string
                                });
                            }
                        }}
                        options={specialties}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                        }
                        ListboxProps={{
                            sx: {
                                maxHeight: 100,
                                overflowY: 'auto'
                            }
                        }}
                        sx={{ width: 200}}
                        renderInput={(params) => <TextField {...params} label="Specialty" />}
                    />

                    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
                        Clinical information
                    </Typography>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Reason for referral"
                        required
                        size="small"
                        value={props.referralFields?.reasonReferral}
                        onChange={(e) => props.setReferralFields({...props.referralFields, reasonReferral: e.target.value})}
                    />


                    <TextField
                        fullWidth
                        label="Suspected / provisional diagnosis *"
                        size="small"
                        value={props.referralFields?.suspectedDiagnosis}
                        onChange={(e) => props.setReferralFields({...props.referralFields, suspectedDiagnosis: e.target.value})}
                    />


                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Additional medical information"
                        placeholder="Previous investigations, current treatment, relevant history (optional)"
                        size="small"
                        value={props.referralFields?.relevantClinicalInformation}
                        onChange={(e) => props.setReferralFields({...props.referralFields, relevantClinicalInformation: e.target.value})}
                    />

                    <Autocomplete
                        disableClearable
                        value={validity.find((x) => x === props.referralFields?.validityInDays)}
                        onChange={(_, newValue) => {
                            if(props.referralFields)
                            {
                                props.setReferralFields({
                                    ...props.referralFields,
                                    validityInDays: newValue
                                });
                            }
                        }}
                        options={validity}
                        getOptionLabel={(option) => `${option} days`}
                        ListboxProps={{
                            sx: {
                                maxHeight: 100,
                                overflowY: 'auto'
                            }
                        }}
                        sx={{ width: 200}}
                        renderInput={(params) => <TextField {...params }  label="Validity" />}
                    />

                </Stack>
            </DialogContent>
        </>
    );
}
