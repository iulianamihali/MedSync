import {Autocomplete, Box, Button, Checkbox, ListItemText, TextField, Typography,} from "@mui/material";
import {useEffect, useState} from "react";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import useAuth from "../../store/features/auth/authHook";
import type {SpecialtyServices} from "./ServicesPage";
import verifyRole from "../../utils/verifyRole";
import UserEnumType from "../../enums/UserEnumType";

type Props = {
    specialtyServices: SpecialtyServices[];
    onSuccess: () => void;
}

export type SelectOptionDto = {
    id: string;
    name: string;
}

export default function AddSpecialtyServicesView(props: Props) {

    const auth = useAuth();
    const ins = auth.user?.ins;
    const role = auth.user?.role;
    const doctorId = useAuth().user?.sub;
    const [specialties, setSpecialties] = useState<SelectOptionDto[]>([]);
    const [services, setServices] = useState<SelectOptionDto[]>([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState<SelectOptionDto | null>(null);
    const [selectedServices, setSelectedServices] = useState<SelectOptionDto[]>([]);
    const existingSpecialtyIds =
        props.specialtyServices?.map(s => s.specialtyId) ?? [];
    const serviceIds: string[] = [];
    for (const service of selectedServices) {
        serviceIds.push(service.id);
    }
    let selectedSpecialtyId = "";
    if (selectedSpecialty !== null) {
        selectedSpecialtyId = selectedSpecialty.id;
    }
    const [specialtiesByInstitution, setSpecialtiesByInstitution] = useState<SelectOptionDto[]>([]);
    const isLocalAdmin = verifyRole(UserEnumType.LocalAdmin, role);
    const isDoctor = verifyRole(UserEnumType.Doctor, role);
    const [servicesByInstitution, setServicesByInstitution] = useState<SelectOptionDto[]>([]);

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

    const getServices = () => {
        const url = `${GlobalSettings.globalDataRoute}/getServices`;
        axiosUtil.get<SelectOptionDto[]>(url)
            .then (res => {
                setServices(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }
    useEffect(() => {
        if(isLocalAdmin)
        {
            getSpecialties();
            getServices();
        }

    }, []);

    const getSpecialtiesByInstitution = (institutionId: string) => {
        const url = `${GlobalSettings.institutionRoute}/getSpecialties/${institutionId}`;
        axiosUtil.get<SelectOptionDto[]>(url)
            .then (res => {
                setSpecialtiesByInstitution(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }

    const getServicesByInstitution = (institutionId: string) => {
        const url = `${GlobalSettings.institutionRoute}/getServices/${institutionId}`;
        axiosUtil.get<SelectOptionDto[]>(url)
            .then (res => {
                setServicesByInstitution(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }

    useEffect(() => {
        getSpecialtiesByInstitution(ins);
        getServicesByInstitution(ins);
    }, [ins]);


    const addService = () => {
        const url = `${GlobalSettings.institutionRoute}/addService`;
        const req = {
            institutionId: ins,
            specialtyId: selectedSpecialtyId,
            services: serviceIds,
        }
        axiosUtil.post<SelectOptionDto[]>(url, req)
            .then (res => {
                props.onSuccess();
            })
            .catch(err => {
                console.error(err);
            })
    }

    const addServiceByDoctor = () => {
        const url = `${GlobalSettings.doctorRoute}/addService`;
        const req = {
            institutionId: ins,
            specialtyId: selectedSpecialtyId,
            doctorId: doctorId,
            services: serviceIds,
        }
        axiosUtil.post<SelectOptionDto[]>(url, req)
            .then (res => {
                props.onSuccess();
                console.log(res.data);
            })
            .catch(err => {
                console.error(err);
            })
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                p: 1,
            }}
        >
            <Typography variant="body2" color="text.secondary">
                Choose a specialty and select the services your institution provides.
            </Typography>

            <Box>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 500,
                        color: "text.secondary",
                        mb: 0.5,
                        display: "block",
                    }}
                >
                    SPECIALTY
                </Typography>

                <Autocomplete
                    options={isLocalAdmin ? specialties : isDoctor ? specialtiesByInstitution : []}
                    value={selectedSpecialty}
                    onChange={(_, newValue) => setSelectedSpecialty(newValue)}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionDisabled={(option) =>
                        existingSpecialtyIds.includes(option.id)
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                            placeholder="Select a specialty"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: 44,
                                    fontSize: 14,
                                    borderRadius: 2,
                                    backgroundColor: "#fafafa",
                                },
                            }}
                        />
                    )}
                />
            </Box>

            <Box>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 500,
                        color: "text.secondary",
                        mb: 0.5,
                        display: "block",
                    }}
                >
                    SERVICES
                </Typography>

                <Autocomplete
                    multiple
                    options={isLocalAdmin ? services : isDoctor ? servicesByInstitution : []}
                    value={selectedServices}
                    onChange={(_, newValue) => setSelectedServices(newValue)}
                    getOptionLabel={(option) => option.name}
                    disableCloseOnSelect
                    renderOption={(props, option) => (
                        <li {...props}>
                            <Checkbox size="small" />
                            <ListItemText primary={option.name} />
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                            placeholder="Select one or more services"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    minHeight: 44,
                                    fontSize: 14,
                                    borderRadius: 2,
                                    backgroundColor: "#fafafa",
                                },
                            }}
                        />
                    )}
                    ListboxProps={{
                        style: {
                            maxHeight: 260,
                        },
                    }}
                />
            </Box>

            <Button
                onClick={isLocalAdmin ? addService : addServiceByDoctor }
                disabled={!selectedSpecialty || selectedServices.length === 0}
                sx={{
                    px: 3,
                    py: 0.8,
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    bgcolor: "#5B9FD8",
                    color: "white",
                    "&:hover": {
                        bgcolor: "#4A8BC2",
                    },

                    '&:disabled': {
                        bgcolor: '#E5EDF5',
                        color: '#94a3b8',
                    },
                }}
            >
                Add
            </Button>

        </Box>
    );
}
