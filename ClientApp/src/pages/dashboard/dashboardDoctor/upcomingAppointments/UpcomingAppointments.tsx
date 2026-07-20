import {Chip, IconButton, Paper, Stack, Tooltip, Typography} from "@mui/material";
import AppointmentStatusEnumType, {appointmentStatusValues} from "../../../../enums/AppointmentStatusEnumType";
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import {useMemo, useState} from "react";
import DateTimeFormat from "../../../../common/dateTimeUtil";
import EditIcon from '@mui/icons-material/Edit';
import CustomPopUp from "../../../../components/CustomPopUp";
import type {EditStatusAppointmentEntity} from "../../../../models/EditStatusAppointmentEntity";
import GlobalSettings from "../../../../GlobalSettings.json";
import axiosUtil from "../../../../common/axiosUtil";
import type {DetailsUpcomingAppointmentsResponseDto} from "../mainGridDoctor/types";
import PatientMedicalRecordView from "../mainGridDoctor/patientMedicalRecordView/PatientMedicalRecordView";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import ReferralModal, {type ReferralInfo} from "../../../patients/components/ReferralModal";
import PrescriptionModal, {type AddPrescription, type Medication} from "../../../patients/components/PrescriptionModal";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";

export type Props = {
    title?: string;
    items: DetailsUpcomingAppointmentsResponseDto[];
    onClickCallBack: () => void;
};

const statusColors = {
    Canceled: { bg: "#F5F5F5", color: "#616161" },
    Missed: { bg: "#FFEBEE", color: "#C62828" },
    Confirmed: { bg: "#E3F2FD", color: "#1976D2" },
    InProgress: { bg: "#FFF3E0", color: "#EF6C00" },
    Rescheduled: { bg: "#FFF3E0", color: "#E65100" },
    Completed: { bg: "#E8F5E9", color: "#2E7D32" },
};

export default function UpcomingAppointments(props: Props) {
    const [searchText, setSearchText] = useState<string>("");
    const [openEdit, setOpenEdit] = useState<boolean>(false);
    const [infoPopup, setInfoPopup] = useState<EditStatusAppointmentEntity | null>(null);
    const [appointmentId, setAppointmentId] = useState<string | null>(null);
    const [openReferral, setOpenReferral] = useState<boolean>(false);
    const [openPrescription, setOpenPrescription] = useState<boolean>(false);
    const [referralFields, setReferralFields] = useState<ReferralInfo>({
        specialtyId: null,
        appointmentId: null,
        reasonReferral: null,
        suspectedDiagnosis: null,
        relevantClinicalInformation: null,
        validityInDays: null
    });
    const [medicalReferralId, setMedicalReferralId] = useState<string>("");

    const [medicalPrescriptionId, setMedicalPrescriptionId] = useState<string | null>(null);
    const [addMedicationsB, setAddMedicationsB] = useState<AddPrescription>({
        appointmentId: appointmentId,
        diagnosis: null,
        medications: [{
            medicationName: null,
            strength: null,
            dosage: null,
            frequency: null,
            duration: null,
        }]
    });

    const addPrescription = () => {
        const url = `${GlobalSettings.medicalPrescription}/addPrescription`;
        axiosUtil.post<string>(url, addMedicationsB)
            .then(res => {
                setMedicalPrescriptionId(res.data);
                getMedicalPrescriptionPdf(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }

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

        const listOfAppointmentsBySearch = useMemo(() => {
            if (props?.items?.length === 0) {
                return [];
            }
            return props.items.filter(x => x.patientName.toLowerCase().includes(searchText.toLowerCase()));

        }, [searchText, props.items]);

        const updateStatusAppointment = () => {
            const url = `${GlobalSettings.localAdminRoute}/updateStatusAppointment`;
            const params = {
                appointmentId: infoPopup?.id,
                status: infoPopup?.status
            };
            axiosUtil.put<boolean>(url, params)
                .then(res => {
                    if (res.data)
                        props.onClickCallBack();
                })
                .catch(err => {
                    console.error(err);
                })

        }

        const createMedicalReferral = () => {
            const url = `${GlobalSettings.medicalReferrals}/createMedicalReferral`;
            if (!referralFields)
                return;
            const req = {
                specialtyId: referralFields.specialtyId,
                appointmentId: appointmentId,
                reasonReferral: referralFields.reasonReferral,
                suspectedDiagnosis: referralFields.suspectedDiagnosis,
                relevantClinicalInformation: referralFields.relevantClinicalInformation,
                validityInDays: referralFields.validityInDays,
            }
            axiosUtil.post(url, req)
                .then(res => {
                    getMedicalReferralPdf(res.data);
                    setReferralFields({
                        specialtyId: null,
                        appointmentId: null,
                        reasonReferral: null,
                        suspectedDiagnosis: null,
                        relevantClinicalInformation: null,
                        validityInDays: null
                    });
                    setMedicalReferralId(res.data);
                })
                .catch(err => {
                    console.error(err);
                })
        }

        const getMedicalReferralPdf = (medicalReferralId: string) => {
            const url = `${GlobalSettings.medicalReferrals}/getMedicalReferralPdf/${medicalReferralId}`;
            axiosUtil.get(url, {responseType: "blob",})
                .then(res => {
                    const blob = new Blob([res.data], {type: "application/pdf"});
                    const url = window.URL.createObjectURL(blob);

                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "MedicalReferral.pdf";
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
                    p: 3,
                    borderRadius: "16px",
                    border: "1px solid #ddd",
                    bgcolor: "#fafafa",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                }}
            >
                <div className="header-section">
                    <Typography variant="h6" fontWeight={500}>
                        {props.title ?? "Today's Appointments"}
                    </Typography>
                    <TextField
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search"
                        variant="standard"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon/>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    >
                    </TextField>
                </div>

                <Stack spacing={1.5} className="list">
                    {listOfAppointmentsBySearch.map((item) => (
                        <Paper
                            className="appointment-card"
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: "16px",
                                border: "1px solid #e2e2e2",
                                bgcolor: "#fff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                            }}
                        >
                            <Stack className="col-info" spacing={0.3}>
                                <Typography fontWeight={600}>{item.patientName}</Typography>
                                <Typography variant="body2" sx={{color: "grey.600"}}>
                                    {DateTimeFormat.timeFormat(item.dateTimeUtc)}
                                </Typography>
                            </Stack>

                            <Typography className="col-type" variant="body2" sx={{pr: 20, color: "grey.700"}}>
                                {item.type}
                            </Typography>

                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Chip
                                    label={appointmentStatusValues.find(x => x.id === item.status)?.text}
                                    sx={{
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        minWidth: "100px",
                                        justifyContent: "center",
                                        bgcolor: statusColors[AppointmentStatusEnumType[item.status]].bg,
                                        color: statusColors[AppointmentStatusEnumType[item.status]].color,
                                    }}
                                />

                                <Tooltip title="Edit consultation">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setOpenEdit(true);
                                            setAppointmentId(item?.appointmentId);
                                        }}
                                        sx={{
                                            p: 0.5, '&:hover': {
                                                bgcolor: '#F5F5F5',
                                                transform: 'scale(1.1)'
                                            }
                                        }}
                                    >
                                        <EditIcon sx={{fontSize: 20}}/>
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Create referral">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setOpenReferral(true);
                                            setAppointmentId(item?.appointmentId);
                                        }}
                                        sx={{
                                            p: 0.5, '&:hover': {
                                                bgcolor: '#F5F5F5',
                                                transform: 'scale(1.1)'
                                            }
                                        }}
                                    >
                                        <MedicalInformationIcon sx={{fontSize: 20}}/>
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Create prescription">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setOpenPrescription(true);
                                            setAppointmentId(item?.appointmentId);
                                            setAddMedicationsB({...addMedicationsB, appointmentId: item?.appointmentId})

                                        }}
                                        sx={{
                                            p: 0.5, '&:hover': {
                                                bgcolor: '#F5F5F5',
                                                transform: 'scale(1.1)'
                                            }
                                        }}
                                    >
                                        <NoteAddIcon sx={{fontSize: 20}}/>
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
                <CustomPopUp
                    open={openEdit}
                    setOpen={setOpenEdit}
                    title={"Edit Medical Information"}
                    contentComponent={PatientMedicalRecordView}
                    dataComponent={{
                        // editStatusAppointmentEntity: infoPopup,
                        // setEditStatusAppointmentEntity: setInfoPopup
                        appointmentId: appointmentId,
                    }}
                    showActions={false}
                    // textButton={"Save"}
                    onClickCallback={updateStatusAppointment}
                    width="100vw"
                />

                <CustomPopUp
                    open={openReferral}
                    setOpen={setOpenReferral}
                    title={"Create Referral"}
                    contentComponent={ReferralModal}
                    dataComponent={{
                        appointmentId: appointmentId,
                        referralFields: referralFields,
                        setReferralFields: setReferralFields,
                    }}
                    showActions={true}
                    textButton={"Generate Referral"}
                    onClickCallback={createMedicalReferral}
                    width="100vw"
                />

                <CustomPopUp
                    open={openPrescription}
                    setOpen={setOpenPrescription}
                    title={"Create Prescription"}
                    contentComponent={PrescriptionModal}
                    dataComponent={{
                        addMedicationsB: addMedicationsB,
                        setAddMedicationsB: setAddMedicationsB,

                    }}
                    showActions={true}
                    textButton={"Generate Prescription"}
                    onClickCallback={addPrescription}
                    width="100vw"
                />
            </Paper>
        );
}
