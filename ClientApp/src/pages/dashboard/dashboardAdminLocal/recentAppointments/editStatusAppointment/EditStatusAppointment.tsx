import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import {Autocomplete, TextField} from "@mui/material";
import type {
    EditStatusAppointmentEntity
} from "../../../../../models/EditStatusAppointmentEntity";
import AppointmentStatusEnumType from "../../../../../enums/AppointmentStatusEnumType";

const FormGrid = styled(Grid)(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

export type Props = {
    editStatusAppointmentEntity: EditStatusAppointmentEntity;
    setEditStatusAppointmentEntity: (editStatusAppointment: EditStatusAppointmentEntity) => void;
}

export default function EditStatusAppointment(props: Props) {

    const options = [
        {
            id: AppointmentStatusEnumType.Canceled,
            label: "Canceled",
        },
        {
            id: AppointmentStatusEnumType.Missed,
            label: "Missed",
        },
        {
            id: AppointmentStatusEnumType.Confirmed,
            label: "Confirmed",
        },
        {
            id: AppointmentStatusEnumType.InProgress,
            label: "In progress",
        },
        {
            id: AppointmentStatusEnumType.Completed,
            label: "Completed",
        }
    ];

    return (
        <Grid container spacing={3} sx={{display: 'flex', flexDirection: 'column', paddingLeft: 3}}>
            <FormGrid size={{ xs: 6 }}>
                <TextField
                    disabled
                    id="patient-name"
                    value={props.editStatusAppointmentEntity.patientName}
                    name="patientName"
                    label="Patient name"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="organization"
                />
            </FormGrid>
            <FormGrid size={{ xs: 6 }}>
                <TextField
                    disabled
                    id="doctor-name"
                    value={props.editStatusAppointmentEntity.doctorName}
                    name="doctorName"
                    label="Doctor name"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="organization"
                />
            </FormGrid>
            <FormGrid size={{ xs: 6 }}>
                <TextField
                    disabled
                    id="dateTimeUtc"
                    value={props.editStatusAppointmentEntity.dateTimeUtc}
                    name="dateTimeUtc"
                    label="Time"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="organization"
                />
            </FormGrid>
            <FormGrid size={{ xs: 6 }}>
                <Autocomplete
                    disableClearable
                    value={options.find(x => x.id === props.editStatusAppointmentEntity.status)}
                    onChange={(_, newValue) => {
                        props.setEditStatusAppointmentEntity({
                            ...props.editStatusAppointmentEntity,
                            status: newValue.id
                        })
                    }}
                    options={options}
                    ListboxProps={{
                        sx: {
                            maxHeight: 100,
                            overflowY: 'auto'
                        }
                    }}
                    sx={{ width: 200}}
                    renderInput={(params) => <TextField {...params} label="Status" />}
                />

            </FormGrid>
            <FormGrid size={{ xs: 6 }}>
                <TextField
                    disabled
                    id="price"
                    type="number"
                    value={props.editStatusAppointmentEntity.price}
                    name="price"
                    label="Price"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="organization"
                />
            </FormGrid>

        </Grid>
    );
}