import {Box} from "@mui/system";
import {Button, CircularProgress, Divider, Switch, TextField, Typography} from "@mui/material";
import Grid from '@mui/material/Grid';
import {styled} from '@mui/material/styles';
import {MuiTelInput} from "mui-tel-input";
import {useEffect, useState} from "react";
import type {
    DoctorWorkingHoursDayDto,
    SaveDoctorWorkingHoursRequestDto,
    SettingsDataDoctorDto,
    SettingsDataUserDto,
} from "./types";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import useAuth from "../../store/features/auth/authHook";
import verifyRole from "../../utils/verifyRole";
import UserEnumType from "../../enums/UserEnumType";

const FormGrid = styled(Grid)(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

type WorkingHoursUiDay = {
    day: string;
    enabled: boolean;
    start: string;
    end: string;
};

const SettingsPage = () => {
    const role = useAuth()?.user?.role;
    const id = useAuth()?.user?.sub;
    const institutionId = useAuth()?.user?.ins;
    const [data, setData] = useState<SettingsDataUserDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [disableButton, setDisableButton] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [doctorInfo, setDoctorInfo] = useState<SettingsDataDoctorDto | null>(null);
    const [hasWorkingHoursChanges, setHasWorkingHoursChanges] = useState<boolean>(false);
    const [workingHoursUi, setWorkingHoursUi] = useState<WorkingHoursUiDay[]>([]);

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        const personalInfo =
            error(data?.firstName) ||
            error(data?.lastName) ||
            error(data?.phoneNumber) ||
            error(data?.email);

        const addressInfo =
            (verifyRole(UserEnumType.Patient, role) || verifyRole(UserEnumType.Doctor, role)) &&
            (error(data?.country) ||
                error(data?.city) ||
                error(data?.streetAddress) ||
                error(data?.streetNumber) ||
                error(data?.postalCode));
        const institutionInfo =
            verifyRole(UserEnumType.LocalAdmin, role) &&
            (error(data?.institutionName) ||
             error(data?.cui));
        const result = personalInfo || addressInfo || institutionInfo;
        const hasDoctorWorkingHoursChanges = verifyRole(UserEnumType.Doctor, role) && hasWorkingHoursChanges;

        setDisableButton(result || (!hasChanges && !hasDoctorWorkingHoursChanges));
    }, [data, role, hasChanges, hasWorkingHoursChanges]);

    const getData = () => {
        const url = `${GlobalSettings.userRoute}/getUserSettingsData/${id}`;
        setLoading(true);
        axiosUtil.get<SettingsDataUserDto>(url)
            .then (res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }

    const getDoctorData = (doctorId: string) => {
        const url = `${GlobalSettings.doctorRoute}/getInfoDoctor/${doctorId}`;
        axiosUtil.get<SettingsDataDoctorDto>(url)
            .then (res => {
                setDoctorInfo(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }

    const getDoctorWorkingHours = (institution: string, doctorId: string) => {
        const url = `${GlobalSettings.doctorRoute}/workingHours/${institution}/${doctorId}`;
        axiosUtil.get<DoctorWorkingHoursDayDto[]>(url)
            .then((res) => {
                setWorkingHoursUi(res.data);
                setHasWorkingHoursChanges(false);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const saveDoctorWorkingHours = (institution: string, doctorId: string) => {
        const url = `${GlobalSettings.doctorRoute}/workingHours`;
        const payload: SaveDoctorWorkingHoursRequestDto = {
            institutionId: institution,
            doctorId,
            workingHours: workingHoursUi,
        };
        return axiosUtil.post<boolean>(url, payload);
    };

    useEffect(() => {
        if (
            typeof id === "string" &&
            typeof institutionId === "string" &&
            verifyRole(UserEnumType.Doctor, role)
        ) {
            getDoctorData(id);
            getDoctorWorkingHours(institutionId, id);
        }
    }, [id, role, institutionId]);


    const editInfo = () => {
        const operations: Promise<unknown>[] = [];

        if (hasChanges && data) {
            const url = `${GlobalSettings.userRoute}/editInfoUsers`;
            operations.push(axiosUtil.put<boolean>(url, data));
        }

        if (
            hasWorkingHoursChanges &&
            typeof institutionId === "string" &&
            typeof id === "string" &&
            verifyRole(UserEnumType.Doctor, role)
        ) {
            operations.push(saveDoctorWorkingHours(institutionId, id));
        }

        if (operations.length === 0) return;

        Promise.all(operations)
            .then(() => {
                setHasChanges(false);
                setHasWorkingHoursChanges(false);
            })
            .catch(err => {
                console.error(err);
            })
    }

    const error = (value?: string | null): boolean => {
        return value === null || value === undefined || value === "" || value.length === 0;
    }

    const onChangeValue = (value: string, name: keyof SettingsDataUserDto) => {
        setData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [name]: value,
            };
        });
        setHasChanges(true);
    }


    const onChangeWorkingHoursUi = (
        index: number,
        key: "enabled" | "start" | "end",
        value: boolean | string
    ) => {
        const newList = [...workingHoursUi];
        newList[index] = {
            ...newList[index],
            [key]: value,
        };
        setWorkingHoursUi(newList);
        setHasWorkingHoursChanges(true);
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: { sm: '100%', md: '1700px' },
                mt: 7,
                px: 3,
                boxSizing: 'border-box',
            }}
        >
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 0.5,
                        fontWeight: 500,
                        fontSize: 24,
                        color: 'text.primary',
                        letterSpacing: '-0.5px'
                    }}
                >
                    Profile
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: '#7f8c8d',
                        fontSize: '0.9rem'
                    }}
                >
                    Manage your account information
                </Typography>
            </Box>

            <Divider sx={{ mb: 5, borderColor: '#e8e8e8' }} />
            {!loading ?
            <>
                <Box sx={{
                bgcolor: 'white',
                borderRadius: 2,
                p: 4,
                mb: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
            }}>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 3.5,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontSize: '1.15rem'
                    }}
                >
                    Personal Information
                </Typography>

                <Grid container spacing={3}>
                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            id="first-name"
                            value={data?.firstName}
                            onChange={(e) => onChangeValue(e.target.value, "firstName")}
                            name="firstName"
                            label="First name"
                            variant="standard"
                            required
                            error={error(data?.firstName)}
                            fullWidth
                            autoComplete="name"
                        />
                    </FormGrid>

                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            id="last-name"
                            value={data?.lastName}
                            onChange={(e) => onChangeValue(e.target.value, "lastName")}
                            name="lastName"
                            label="Last name"
                            variant="standard"
                            required
                            error={error(data?.lastName)}
                            fullWidth
                            autoComplete="name"
                        />
                    </FormGrid>

                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <MuiTelInput
                            label="Phone"
                            variant="standard"
                            required
                            error={error(data?.phoneNumber)}
                            fullWidth
                            defaultCountry="RO"
                            forceCallingCode
                            value={data?.phoneNumber}
                            onChange={(value) => onChangeValue(value, "phoneNumber")}
                            // onBlur={() => setTouched(true)}
                            // error={touched && !!props.formRegisterInstitution.phoneNumber && !isValidPhoneNumber(props.formRegisterInstitution.phoneNumber)}
                            // helperText={touched && !!props.formRegisterInstitution.phoneNumber && !isValidPhoneNumber(props.formRegisterInstitution.phoneNumber) ? 'Invalid phone number' : ''}
                        />
                    </FormGrid>

                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            id="email"
                            value={data?.email}
                            onChange={(e) => onChangeValue(e.target.value, "email")}
                            name="email"
                            label="Email"
                            type="email"
                            variant="standard"
                            required
                            error={error(data?.email)}
                            fullWidth
                            autoComplete="email"
                        />
                    </FormGrid>

                </Grid>
            </Box>
                { verifyRole(UserEnumType.Patient, role) || verifyRole(UserEnumType.Doctor, role)
                 ?
            <Box sx={{
                bgcolor: 'white',
                borderRadius: 2,
                p: 4,
                mb: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
            }}>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 3.5,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontSize: '1.15rem'
                    }}
                >
                    Address Details
                </Typography>

                <Grid container spacing={3}>
                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            id="country"
                            value={data?.country}
                            onChange={(e) => onChangeValue(e.target.value, "country")}
                            name="country"
                            label="Country"
                            variant="standard"
                            required
                            error={error(data?.country)}
                            fullWidth
                            autoComplete="country"
                        />
                    </FormGrid>

                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            id="city"
                            value={data?.city}
                            onChange={(e) => onChangeValue(e.target.value, "city")}
                            name="city"
                            label="City"
                            variant="standard"
                            required
                            error={error(data?.city)}
                            fullWidth
                            autoComplete="address-level2"
                        />
                    </FormGrid>

                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            id="address"
                            value={data?.streetAddress}
                            onChange={(e) => onChangeValue(e.target.value, "streetAddress")}
                            name="address"
                            label="Street Address"
                            variant="standard"
                            required
                            error={error(data?.streetAddress)}
                            fullWidth
                            autoComplete="street-address"
                        />
                    </FormGrid>

                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            id="streetNumber"
                            value={data?.streetNumber}
                            onChange={(e) => onChangeValue(e.target.value, "streetNumber")}
                            name="streetNumber"
                            label="Street Number"
                            variant="standard"
                            required
                            error={error(data?.streetNumber)}
                            fullWidth
                        />
                    </FormGrid>

                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            id="postalCode"
                            value={data?.postalCode}
                            onChange={(e) => onChangeValue(e.target.value, "postalCode")}
                            name="postalCode"
                            label="Zip / Postal code"
                            variant="standard"
                            required
                            error={error(data?.postalCode)}
                            fullWidth
                            autoComplete="postal-code"
                        />
                    </FormGrid>
                </Grid>
            </Box>
                        : null}

                { verifyRole(UserEnumType.Doctor, role)
                    ?
                    <>
            <Box sx={{
                bgcolor: 'white',
                borderRadius: 2,
                p: 4,
                mb: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
            }}>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 3.5,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontSize: '1.15rem'
                    }}
                >
                    Professional Information
                </Typography>

                <Grid container spacing={3}>
                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            id="specialization"
                            disabled
                            value={doctorInfo?.specialties ?? ""}
                            // onChange={(e) => props.setFormData({...props.formData, specialization: e.target.value})}
                            name="specialization"
                            label="Specialization"
                            variant="standard"
                            required
                            fullWidth
                            placeholder="e.g., Cardiology, Pediatrics"
                        />
                    </FormGrid>

                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            disabled
                            id="yearsOfExperience"
                            value={doctorInfo?.yearsOfExperience ?? 0}
                            // onChange={(e) => props.setFormData({...props.formData, yearsOfExperience: e.target.value})}
                            name="yearsOfExperience"
                            label="Years of Experience"
                            type="number"
                            variant="standard"
                            required
                            fullWidth
                        />
                    </FormGrid>

                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            disabled
                            id="medicalLicenseNumber"
                            value={doctorInfo?.medicalLicenseNumber ?? ""}
                            // onChange={(e) => props.setFormData({...props.formData, medicalLicenseNumber: e.target.value})}
                            name="medicalLicenseNumber"
                            label="Medical License Number"
                            variant="standard"
                            required
                            fullWidth
                        />
                    </FormGrid>

                    <FormGrid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            id="universityName"
                            disabled
                            value={doctorInfo?.universityName ?? ""}
                            // onChange={(e) => props.setFormData({...props.formData, universityName: e.target.value})}
                            name="universityName"
                            label="University Name"
                            variant="standard"
                            required
                            fullWidth
                            placeholder="Where you studied medicine"
                        />
                    </FormGrid>
                </Grid>
            </Box>
                        <Box sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            p: 4,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: '1px solid #f0f0f0'
                        }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 3.5,
                                    fontWeight: 600,
                                    color: '#2c3e50',
                                    fontSize: '1.15rem'
                                }}
                            >
                                Working Hours
                            </Typography>

                            <Grid container spacing={2}>
                                {workingHoursUi.map((item, index) => (
                                    <Grid key={item.day} size={{ xs: 12 }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                            p: 1.5,
                                            borderRadius: 1.5,
                                            border: item.enabled ? '1px solid #dce9e5' : '1px solid #f3dede',
                                            backgroundColor: item.enabled ? '#f6fbf9' : '#fff9f9',
                                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                            '&:hover': {
                                                borderColor: item.enabled ? '#9ecfc6' : '#edcaca',
                                                boxShadow: item.enabled
                                                    ? '0 2px 6px rgba(45, 101, 95, 0.08)'
                                                    : '0 2px 6px rgba(173, 82, 82, 0.06)',
                                            },
                                            flexWrap: { xs: 'wrap', lg: 'nowrap' },
                                        }}>
                                            <Typography sx={{
                                                minWidth: { xs: '100%', sm: 120 },
                                                fontWeight: 500,
                                                color: '#2c3e50'
                                            }}>
                                                {item.day}
                                            </Typography>

                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                minWidth: { xs: '100%', sm: 'auto' },
                                                justifyContent: { xs: 'flex-start', sm: 'center' }
                                            }}>
                                                <Typography sx={{ fontSize: '0.82rem', color: '#607d8b' }}>Off</Typography>
                                                <Switch
                                                    checked={item.enabled}
                                                    onChange={(e) => onChangeWorkingHoursUi(index, "enabled", e.target.checked)}
                                                    sx={{
                                                        width: 42,
                                                        height: 26,
                                                        padding: 0,
                                                        display: 'flex',
                                                        '& .MuiSwitch-switchBase': {
                                                            padding: '3px',
                                                            transitionDuration: '220ms',
                                                            '&.Mui-checked': {
                                                                transform: 'translateX(16px)',
                                                                color: '#fff',
                                                            },
                                                            '&.Mui-checked + .MuiSwitch-track': {
                                                                background: 'linear-gradient(180deg, rgba(74, 144, 226, 0.25) 0%, rgba(125, 225, 154, 0.25) 100%)',
                                                                opacity: 1,
                                                                border: 'none',
                                                                boxShadow: 'inset 0 0 0 1px rgba(74, 144, 226, 0.18)',
                                                            },
                                                        },
                                                        '& .MuiSwitch-track': {
                                                            borderRadius: 999,
                                                            overflow: 'hidden',
                                                            background: 'linear-gradient(180deg, #e5e7eb 0%, #d1d5db 100%)',
                                                            opacity: 1,
                                                        },
                                                        '& .MuiSwitch-thumb': {
                                                            width: 20,
                                                            height: 20,
                                                            background: '#fff',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                        },
                                                    }}
                                                />
                                                <Typography sx={{ fontSize: '0.82rem', color: '#607d8b' }}>On</Typography>
                                            </Box>

                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                minWidth: { xs: '100%', md: 'auto' },
                                                width: { xs: '100%', md: 'auto' },
                                                flexDirection: { xs: 'column', sm: 'row' },
                                            }}>
                                                <TextField
                                                    type="time"
                                                    label="From"
                                                    size="small"
                                                    disabled={!item.enabled}
                                                    value={item.start}
                                                    onChange={(e) => onChangeWorkingHoursUi(index, "start", e.target.value)}
                                                    slotProps={{ inputLabel: { shrink: true } }}
                                                    sx={{
                                                        minWidth: { xs: '100%', sm: 130 },
                                                        width: { xs: '100%', sm: 'auto' },
                                                        '& .MuiInputLabel-root': {
                                                            color: '#6b7f7a',
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: '#2d655f',
                                                        },
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '10px',
                                                            backgroundColor: item.enabled ? '#ffffff' : '#f2f5f4',
                                                            '& fieldset': {
                                                                borderColor: '#d7e4e0',
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: '#8dc4ba',
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#2d655f',
                                                                boxShadow: '0 0 0 2px rgba(123, 200, 190, 0.25)',
                                                            },
                                                            '&.Mui-disabled': {
                                                                color: '#9aa6a3',
                                                            },
                                                        },
                                                        '& input::-webkit-calendar-picker-indicator': {
                                                            filter: 'hue-rotate(110deg) saturate(80%) brightness(0.75)',
                                                            cursor: 'pointer',
                                                        },
                                                    }}
                                                />
                                                <TextField
                                                    type="time"
                                                    label="To"
                                                    size="small"
                                                    disabled={!item.enabled}
                                                    value={item.end}
                                                    onChange={(e) => onChangeWorkingHoursUi(index, "end", e.target.value)}
                                                    slotProps={{ inputLabel: { shrink: true } }}
                                                    sx={{
                                                        minWidth: { xs: '100%', sm: 130 },
                                                        width: { xs: '100%', sm: 'auto' },
                                                        '& .MuiInputLabel-root': {
                                                            color: '#6b7f7a',
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: '#2d655f',
                                                        },
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '10px',
                                                            backgroundColor: item.enabled ? '#ffffff' : '#f2f5f4',
                                                            '& fieldset': {
                                                                borderColor: '#d7e4e0',
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: '#8dc4ba',
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#2d655f',
                                                                boxShadow: '0 0 0 2px rgba(123, 200, 190, 0.25)',
                                                            },
                                                            '&.Mui-disabled': {
                                                                color: '#9aa6a3',
                                                            },
                                                        },
                                                        '& input::-webkit-calendar-picker-indicator': {
                                                            filter: 'hue-rotate(110deg) saturate(80%) brightness(0.75)',
                                                            cursor: 'pointer',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </>
                        : null}

                {/*{verifyRole(UserEnumType.LocalAdmin, role) ? (*/}
                {/*    <Box sx={{*/}
                {/*        bgcolor: 'white',*/}
                {/*        borderRadius: 2,*/}
                {/*        p: 4,*/}
                {/*        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',*/}
                {/*        border: '1px solid #f0f0f0'*/}
                {/*    }}>*/}
                {/*        <Typography*/}
                {/*            variant="h6"*/}
                {/*            sx={{*/}
                {/*                mb: 3.5,*/}
                {/*                fontWeight: 600,*/}
                {/*                color: '#2c3e50',*/}
                {/*                fontSize: '1.15rem'*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            Institution Information*/}
                {/*        </Typography>*/}

                {/*        <Grid container spacing={3}>*/}
                {/*            <FormGrid size={{ xs: 12, sm: 6 }}>*/}
                {/*                <TextField*/}
                {/*                    id="institutionName"*/}
                {/*                    name="institutionName"*/}
                {/*                    label="Institution Name"*/}
                {/*                    variant="standard"*/}
                {/*                    required*/}
                {/*                    fullWidth*/}
                {/*                    value={data.institutionName}*/}
                {/*                    onChange={(e) => onChangeValue(e.target.value, "institutionName")}*/}
                {/*                />*/}
                {/*            </FormGrid>*/}

                {/*            <FormGrid size={{ xs: 12, sm: 6 }}>*/}
                {/*                <TextField*/}
                {/*                    id="cui"*/}
                {/*                    name="cui"*/}
                {/*                    label="Tax Identification Number (CUI)"*/}
                {/*                    variant="standard"*/}
                {/*                    required*/}
                {/*                    fullWidth*/}
                {/*                    value={data.cui}*/}
                {/*                    onChange={(e) => onChangeValue(e.target.value, "cui")}*/}
                {/*                />*/}
                {/*            </FormGrid>*/}
                {/*        </Grid>*/}
                {/*    </Box>*/}
                {/*) : null}*/}


                <Box sx={{
                    position: 'sticky',
                    bottom: 20,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 4,
                    zIndex: 100
                }}>
                    <Button
                        disabled={disableButton}
                        variant="contained"
                        size="large"
                        onClick={editInfo}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            padding: 0.9,
                            backgroundImage: !disableButton ? 'linear-gradient(to bottom, #7eb9e8, #5ba3d9)' : 'linear-gradient(to bottom, #d1d5db, #9ca3af)',
                            border: '1px solid #5ba3d9',
                            boxShadow: 'inset 0 2px 0 #b8daf5, inset 0 -2px 0 2px #4080b8',
                            '&:hover': {
                                backgroundImage: 'linear-gradient(to bottom, #5ba3d9, #4a91c7)',
                                boxShadow: 'inset 0 2px 0 #9cc9ed, inset 0 -2px 0 2px #3870a0',
                            },
                        }}
                    >
                        Save Changes
                    </Button>
                </Box>
                </>
                : <CircularProgress sx={{marginLeft: '48%', marginTop: '20vh'}}/>}

        </Box>
    );
};

export default SettingsPage;