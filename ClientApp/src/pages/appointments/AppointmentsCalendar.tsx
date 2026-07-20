import React, {useEffect, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../../components/styles/ApointmentsCalendar.scss';
import type {CalendarAppointmentsByDoctorDto, CalendarAppointmentsDto} from "./types";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import useAuth from "../../store/features/auth/authHook";
import './AppointmentsCalendar.scss';
import {appointmentStatusValues} from "../../enums/AppointmentStatusEnumType";
import CustomPopUp from "../../components/CustomPopUp";
import AppointmentsView from "../dashboard/dashboardAdminLocal/mainGridLocal/appointmentsView/AppointmentsView";
import CreateAppointmentView
    from "../dashboard/dashboardAdminLocal/mainGridLocal/appointmentsView/CreateAppointmentView";
import {useLocation} from "react-router-dom";
import UserEnumType from "../../enums/UserEnumType";
import verifyRole from "../../utils/verifyRole";
import PatientMedicalRecordView
    from "../dashboard/dashboardDoctor/mainGridDoctor/patientMedicalRecordView/PatientMedicalRecordView";

const AppointmentsCalendar: React.FC = () => {
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarAppointmentsDto | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [appointments, setAppointments] = useState<CalendarAppointmentsDto[]>([]);
    const [startDate,setStartDate] = useState<Date>();
    const [endDate,setEndDate] = useState<Date>();
    const ins = useAuth().user?.ins;
    const location = useLocation();
    const role: string | undefined = useAuth().user?.role;
    const doctorId = useAuth().user?.sub;
    const [appointmentsByDoctor, setAppointmentsByDoctor] = useState<CalendarAppointmentsByDoctorDto[]>([]);
    useEffect(() => {
        if (location.state?.openCreateAppointment) {
            setShowModalAdd(true);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getAppointments = (from: Date, to: Date, institutionId: string) => {
        const url = `${GlobalSettings.localAdminRoute}/getCalendarAppointments`;
        const req = {
            from: from.toISOString(),
            to: to.toISOString(),
            institutionId: institutionId
        };
        axiosUtil.post<CalendarAppointmentsDto[]>(url, req)
            .then (res => {
                setAppointments(res.data);
            })
            .catch(err => {
                console.error(err);
            })

    }
    const getAppointmentsByDoctor = (from: Date, to: Date, institutionId: string, doctorId: string|undefined)=>
    {
        const url = `${GlobalSettings.appointmentRoute}/getCalendarAppointmentsByDoctor`;
        const req = {
            from: from.toISOString(),
            to: to.toISOString(),
            institutionId: institutionId,
            doctorId: doctorId
        };
        axiosUtil.post<CalendarAppointmentsByDoctorDto[]>(url, req)
            .then (res => {
                setAppointmentsByDoctor(res.data);
            })
            .catch(err => {
                console.error(err);
            })

    }

    useEffect(() => {
        if(startDate && endDate && ins)
        {
            if(verifyRole(UserEnumType.LocalAdmin, role))
                getAppointments(startDate, endDate, ins);
            else if(verifyRole(UserEnumType.Doctor, role))
                getAppointmentsByDoctor(startDate, endDate, ins, doctorId);
        }

    }, [startDate, endDate, ins, role, doctorId]);


    const calendarEvents = verifyRole(UserEnumType.LocalAdmin, role) ? appointments.map(a => ({
        id: a.id,
        title: `${a.service}`,
        start: a.startDateTimeUtc,
        end: a.endDateTimeUtc,
        status: a.status,
        extendedProps: {
            ...a
        }
    })) : appointmentsByDoctor.map(a => ({
        id: a.id,
        title: `${a.patientName} `,
        start: a.startDateTimeUtc,
        end: a.endDateTimeUtc,
        status: a.status,
        extendedProps: {
            ...a
        }
    }));

    const updateInfoAppointment = () => {
        const url = `${GlobalSettings.localAdminRoute}/editInfoAppointment`;
        if (!selectedEvent)
            return;
        const req = {
            id: selectedEvent.id,
            totalPrice: selectedEvent.totalPrice,
            status: selectedEvent.status,
        }
        axiosUtil.post<boolean>(url, req)
            .then (res => {
                if (startDate && endDate && ins) {
                    getAppointments(startDate, endDate, ins);
                }
            })
            .catch(err => {
                console.error(err);
            })
    }

    const handleEventClick = (info: any) => {
        setSelectedEvent(info.event.extendedProps as CalendarAppointmentsDto)
        setShowModalEdit(true);
    };

    const handleDateClick = () => {
        setSelectedEvent(null);
        setShowModalEdit(false);
    };

    return (
        <div className="appointments-calendar">
            <FullCalendar
                eventMaxStack={1}
                datesSet={(e) => {
                    setStartDate(e.start);
                    setEndDate(e.end);
                }}
                slotEventOverlap={true}
                eventMinHeight={80}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
                headerToolbar={{
                    left: 'today',
                    center: 'prev title next',
                    right: isMobile ? 'timeGridDay' : 'timeGridDay,timeGridWeek,dayGridMonth',
                }}
                // locale="ro"
                firstDay={1}
                slotMinTime="08:00:00"
                slotMaxTime="24:00:00"
                height="100%"
                allDaySlot={false}
                events={calendarEvents}
                eventContent={(arg) => {
                    const e = arg.event.extendedProps;
                    const item = appointmentStatusValues.find(x => x.id === e.status);
                        return (
                        <div className="calendar-event">
                            <div className="time">{arg.timeText}</div>
                                <div className="service">{arg.event.title}</div>
                                <div>
                                    {e.service}
                                </div>
                                <div className="status"
                                     style={{color: item?.style?.color, backgroundColor: item?.style?.bg}}
                                >
                                    <span>{item?.icon && <item.icon fontSize="small" className="icon-status"/>}</span>
                                    <span>{item?.text}</span>
                                </div>
                        </div>
                    );
                }}
                eventDidMount={(info) => {
                    const status = info.event.extendedProps.status;
                    const item = appointmentStatusValues.find(x => x.id === status);

                    if (!item) return;

                    info.el.style.setProperty(
                        '--fc-event-border-color',
                        item.style.color
                    );

                    info.el.style.borderWidth = '2px';
                    if (info.el.closest('.fc-popover')) {
                        info.el.style.borderLeft = `4px solid ${item.style.color}`;
                        info.el.style.background = '#fff';
                    }
                }}

                eventClick={handleEventClick}
                dateClick={handleDateClick}
                editable={false}
                selectable={false}
                // nowIndicator={true}
                eventDisplay="block"
                buttonText={{
                    today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                }}
                titleFormat={{ month: 'long', year: 'numeric' }}
                dayHeaderContent={(arg) => {
                    if (arg.view. type === 'dayGridMonth') {
                        return (
                            <div style={{
                                color: '#999',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                            }}>
                                {arg.date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                        );
                    }

                    return (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#999', fontSize: '0.7rem', marginBottom: '4px' }}>
                                {arg.date.toLocaleDateString('en-US', { weekday: 'short' }). toUpperCase()}
                            </div>
                            <div style={{
                                fontSize: isMobile ? '1rem' : '1.3rem',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: arg. isToday ? 'rgba(109, 156, 188, 1)' : 'transparent',
                                color: arg.isToday ? 'white' : '#333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 500,
                                margin: '0 auto'
                            }}>
                                {arg.date. getDate()}
                            </div>
                        </div>
                    );
                }}
            />
            <button
                className="fab-new-appointment"
                onClick={() => {
                    setShowModalAdd(true);
                }}
            >
                +
            </button>
            <CustomPopUp
                open={showModalEdit}
                setOpen={setShowModalEdit}
                title={"Details Appointment"}
                contentComponent={verifyRole(UserEnumType.LocalAdmin, role) ? AppointmentsView : PatientMedicalRecordView}
                dataComponent={verifyRole(UserEnumType.LocalAdmin, role) ? { appointment: selectedEvent,
                    setAppointment: setSelectedEvent,
                } : {appointmentId: selectedEvent?.id}}
                textButton={"Save"}
                showActions={verifyRole(UserEnumType.LocalAdmin, role) ? true : false}
                onClickCallback={updateInfoAppointment}
            />
            <CustomPopUp
                open={showModalAdd}
                setOpen={setShowModalAdd}
                title={"Create appointment"}
                contentComponent={CreateAppointmentView}
                // dataComponent={{
                // }}
                // textButton={"Save"}
                showActions={false}
                onClickCallback={updateInfoAppointment}
            />

        </div>
    );
};

export default AppointmentsCalendar;