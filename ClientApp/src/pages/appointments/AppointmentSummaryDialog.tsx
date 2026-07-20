import './AppointmentSummaryDialog.scss';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Divider,
    Avatar,
    TextField
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type {Specialty} from "../signUp/formSignUp/FormSignUp";
import type {
    Service
} from "../dashboard/dashboardAdminLocal/mainGridLocal/appointmentsView/CreateAppointmentView";
import type {Dayjs} from "dayjs";
import DateTimeFormat from "../../common/dateTimeUtil";
import {useState} from "react";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import useAuth from "../../store/features/auth/authHook";
import type {BookingFor} from "../careGiving/CareGiving";

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    selectedDate: Dayjs | null;
    startTime: string;
    specialty: Specialty;
    service: Service;
    rating: number;
    totalReviews: number;
    doctorName: string;
    doctorId: string;
    institutionId: string;
    onConfirmed?: () => void;
    onClose: () => void;
    bookingFor?: BookingFor;
}

const AppointmentSummaryDialog =  (props: Props) => {
    const patientId = useAuth().user?.sub;
    const [referralCode, setReferralCode] = useState<string>('');

    const createAppointment = () => {
        const url = `${GlobalSettings.appointmentRoute}/addAppointment`;
        const req = {
            ...(props.bookingFor
                    ? { unregisteredPatientId: props.bookingFor.careUnregisteredPatientId }
                    : { patientId: patientId }
            ),
                institutionId: props?.institutionId,
                specialtyId: props.specialty.id,
                serviceId: props.service.id,
                doctorId: props.doctorId,
                startTime: props.startTime,
                referralCode: referralCode,
        };

        axiosUtil.post<boolean>(url, req)
            .then (res => {
                console.log(res.data);
                props?.setOpen(false);
                if(props.onConfirmed) {
                    props.onConfirmed();
                }
            })
            .catch(err => {
                console.error(err);
            })
    }

    return (
        <Dialog open={props?.open} className="appointment-dialog">
            <DialogTitle className="appointment-dialog-title">
                {DateTimeFormat.formatSummary(props?.selectedDate ?? undefined)} <AccessTimeIcon /> {DateTimeFormat.timeFormat(props.startTime)}
            </DialogTitle>

            {props.bookingFor && (
                <Box sx={{
                    mx: 3,
                    mt: 1,
                    px: 2,
                    py: 0.8,
                    borderRadius: "99px",
                    background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                    border: "1px solid #ffcc80",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.8,
                }}>
                    <Typography sx={{ fontSize: "0.7rem", color: "#e65100", fontWeight: 600 }}>
                        👤 Booking for:
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#bf360c", fontWeight: 700 }}>
                        {props.bookingFor.name}
                    </Typography>
                </Box>
            )}
            <Divider />

            <DialogContent>
                <Box className="appointment-dialog-doctor-section">
                    <Avatar className="doctor-avatar" />
                    <Box sx={{ flex: 1 }}>
                        <Box className="doctor-info-header">
                            <Typography variant="subtitle1" fontWeight="700">Dr. {props?.doctorName}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">{props?.specialty.name} - {props?.service.name}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            <b>Rating {props?.rating}</b> • {props?.totalReviews} reviews
                        </Typography>
                    </Box>
                </Box>
                <Box className="referral-container">
                    <label>REFERRAL CODE (OPTIONAL)</label>
                    <TextField onChange={(e) => setReferralCode(e.target.value)} fullWidth size="small" placeholder="Enter code" />
                </Box>
            </DialogContent>


            <DialogActions className="appointment-dialog-actions">
                <Button onClick={()=> createAppointment()} fullWidth variant="contained" disableElevation className="btn-confirm">
                    Confirm selection
                </Button>
                <Button onClick={props.onClose} fullWidth disableElevation className="btn-back">
                    Back
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AppointmentSummaryDialog;