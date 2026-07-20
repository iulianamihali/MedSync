import './RecentAppointments.scss';
import { Chip, Paper, Stack, Typography } from "@mui/material";
import type {DetailsRecentAppointmentsResponseDto} from "../mainGridLocal/types";
import AppointmentStatusEnumType, {appointmentStatusValues} from "../../../../enums/AppointmentStatusEnumType";
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import {useMemo, useState} from "react";
import DateTimeFormat from "../../../../common/dateTimeUtil";
import EditIcon from '@mui/icons-material/Edit';
import CustomPopUp from "../../../../components/CustomPopUp";
import EditStatusAppointment from "./editStatusAppointment/EditStatusAppointment";
import type {EditStatusAppointmentEntity} from "../../../../models/EditStatusAppointmentEntity";
import GlobalSettings from "../../../../GlobalSettings.json";
import axiosUtil from "../../../../common/axiosUtil";

export type Props = {
    title?: string;
    items: DetailsRecentAppointmentsResponseDto[];
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

export default function RecentAppointments(props: Props) {
    const [searchText, setSearchText] = useState<string>("");
    const [openEdit, setOpenEdit] = useState<boolean>(false);
    const [infoPopup, setInfoPopup] = useState<EditStatusAppointmentEntity | null>(null);

    const listOfAppointmentsBySearch = useMemo(() => {
        if(props?.items?.length === 0) {
            return [];
        }
        return props.items.filter(x => x.doctorName.toLowerCase().includes(searchText.toLowerCase()) || x.patientName.toLowerCase().includes(searchText.toLowerCase()));

    }, [searchText, props.items]);

    const updateStatusAppointment = () => {
        const url = `${GlobalSettings.localAdminRoute}/updateStatusAppointment`;
        const params = {
            appointmentId: infoPopup?.id,
            status: infoPopup?.status
        };
        axiosUtil.put<boolean>(url, params)
            .then (res => {
                if(res.data)
                    props.onClickCallBack();
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
                <Typography variant="h6" fontWeight={500} >
                    {props.title ?? "Recent Appointment"}
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
                                    <SearchIcon />
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
    {/* Patient + doctor */}
    <Stack className="col-info" spacing={0.3} >
    <Typography fontWeight={600}>{item.patientName}</Typography>
        <Typography variant="body2" sx={{ color: "grey.600" }}>
            {item.doctorName} • {DateTimeFormat.timeFormat(item.dateTimeUtc)}
    </Typography>
    </Stack>

    {/* Type of appointment */}
    <Typography className="col-type" variant="body2" sx={{ color: "grey.700" }}>
    {item.type}
    </Typography>

    {/* Status */}
                <div className="col-status">
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
                    <div style={{marginLeft: 3, cursor: 'pointer'}}
                         onClick={() => {setOpenEdit(true)
                         const temp:EditStatusAppointmentEntity = {
                             id: item.appointmentId,
                             patientName: item.patientName,
                             doctorName: item.doctorName,
                             dateTimeUtc: DateTimeFormat.timeFormat(item.dateTimeUtc),
                             price: item.price,
                             status: item.status,
                         }
                         setInfoPopup(temp);

                    }}
                    >
                        <EditIcon sx={{height: 23}}/>
                    </div>
                </div>
            </Paper>
))}
    </Stack>
            <CustomPopUp
                open={openEdit}
                setOpen={setOpenEdit}
                title={"Edit Status Appointment"}
                contentComponent={EditStatusAppointment}
                dataComponent={{
                    editStatusAppointmentEntity: infoPopup,
                    setEditStatusAppointmentEntity: setInfoPopup
                }}
                showActions={true}
                textButton={"Save"}
                onClickCallback={updateStatusAppointment}
                width="30vw"
            />
        </Paper>
);
}
