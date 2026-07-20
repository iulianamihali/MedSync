import { Box, Typography, Paper, Chip, Button } from "@mui/material";
import AppointmentCard from "../../../components/AppointmentCard";
import type {AppointmentSummary} from "../PatientDetailsPage";
import DateTimeFormat from "../../../common/dateTimeUtil";
import dayjs from "dayjs";
import type AppointmentStatusEnumType from "../../../enums/AppointmentStatusEnumType";

type Props = {
    appointmentsSummary: AppointmentSummary[];
    updateStatusCallback: (appointmentId: string, status: AppointmentStatusEnumType) => void;
}

const AppointmentsTab = (props: Props) => {
    return (
        <Box sx={{ px: 4, py: 4 }}>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: "60vh", overflowY: "auto", }}>

                {props.appointmentsSummary.map(app => {
                    return(
                        <AppointmentCard medicalRecordId={app.medicalRecordId}
                                        appointmentId={app.appointmentId}
                                        date={`${DateTimeFormat.appointmentDateFormat(dayjs(app.date))} • ${DateTimeFormat.timeFormat(app.date)}`}
                                         status={app.status}
                                         service={app.service}
                                         diagnosis={app.diagnosis}
                                         updateStatusCallback={props.updateStatusCallback}
                        />
                    );
                })}

            </Box>

        </Box>
    );
};


export default AppointmentsTab;
