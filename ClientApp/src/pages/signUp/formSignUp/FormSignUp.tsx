import './FormSignUp.scss';
import {useEffect, useState} from "react";
import {
    Autocomplete,
    Button, Checkbox,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    Link, ListItemText,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import Select from "@mui/material/Select";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {Box} from "@mui/system";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type {SignupRequestDto} from "../../../dtos/auth/SignupRequestDto.ts";
import UserEnumType from "../../../enums/UserEnumType.ts";
import axiosUtil from "../../../common/axiosUtil.ts";
import 'react-phone-number-input/style.css'
import { MuiTelInput } from 'mui-tel-input';
import {isValidPhoneNumber} from "react-phone-number-input";
import {useAppDispatch} from "../../../store/hook";
import {login} from "../../../store/features/auth/authSlice";
import SignUpEntity from "../../../models/SignupEntity";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import useAuth from "../../../store/features/auth/authHook";

export type Specialty = {
    id: string;
    name: string;
}
export default function FormSignUp() {

    const dispatch = useAppDispatch();
    const ins = useAuth().user?.ins;
    const [formSignUp, setFormSignUp] = useState<SignUpEntity>(new SignUpEntity());
    const [showPassword, setShowPassword] = useState(false);
    const [continueButton, setContinueButton] = useState<boolean>(false);
    const [phoneTouched, setPhoneTouched] = useState(false);

    const isFormValid =
        formSignUp.firstName &&
        formSignUp.lastName &&
        formSignUp.gender &&
        formSignUp.dateOfBirth &&
        formSignUp.phoneNumber &&
        formSignUp.email &&
        formSignUp.password &&
        formSignUp.role;
    const isCnpValid =
        formSignUp.cnp &&
        formSignUp.cnp.length === 13 &&
        /^\d+$/.test(formSignUp.cnp);
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let signupData: SignupRequestDto = {
                firstName: formSignUp.firstName,
                lastName: formSignUp.lastName,
                gender: formSignUp.gender,
                dateOfBirth: formSignUp.dateOfBirth,
                phoneNumber: formSignUp.phoneNumber,
                email: formSignUp.email,
                password: formSignUp.password,
                role: formSignUp.role,
            }
            if (formSignUp.role === UserEnumType.Patient)
            {
                signupData = {
                    ...signupData,
                    patientData: {
                        cnp: formSignUp.cnp,
                        insuranceNumber: formSignUp.insuranceCardNumber,
                        emergencyContactName: formSignUp.emergencyContactName,
                        emergencyContactPhone: formSignUp.emergencyContactPhone
                    }
                }
            }
            else if (formSignUp.role === UserEnumType.Doctor)
            {
                signupData = {
                    ...signupData,
                    doctorData: {
                        institutionCode: formSignUp.institutionCode,
                        yearsOfExperience: formSignUp.yearsOfExperience!,
                        licenseNumber: formSignUp.medicalLicenseNumber,
                        universityName: formSignUp.universityName
                    }
                }
            }

            const response = await axiosUtil.post("/auth/signup", signupData);
            const token = response.data;
            if (token) {
                dispatch(login(token));
                // punem navigarea la dashboard dupa
            }
        }catch (e) {
           console.log(e);
        }

    }

    return (
        <>
            <div className={`form-signup-container ${continueButton ? 'is-final' : 'is-initial'}`}>
                <form className="form-fields" onSubmit={handleSignUp}>
                 {!continueButton && (
                     <>
                        <Typography variant="h6" gutterBottom noWrap sx={{textAlign: "center", mt: 2.6}}>
                            Welcome to MedSync
                        </Typography>
                        <TextField
                            label="First Name"
                            required
                            value={formSignUp.firstName}
                            onChange={(e) => setFormSignUp({...formSignUp, firstName: e.target.value})}
                            name="firstName"
                            size="small"
                            fullWidth
                            sx={{mt: 1.4}}
                        />


                        <TextField
                            label="Last Name"
                            required
                            value={formSignUp.lastName}
                            onChange={(e) => setFormSignUp({...formSignUp, lastName: e.target.value})}
                            name="lastName"
                            size="small"
                            fullWidth
                            sx={{my: 1.2}}
                        />

                        <FormControl fullWidth size="small" required>
                            <InputLabel>Gender</InputLabel>
                            <Select
                                name="gender"
                                value={formSignUp.gender}
                                onChange={(e) => setFormSignUp({...formSignUp, gender: e.target.value as string})}
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Date of Birth"
                            required
                            value={formSignUp.dateOfBirth}
                            onChange={(e) => setFormSignUp({...formSignUp, dateOfBirth: e.target.value})}
                            name="dateOfBirth"
                            type="date"
                            size="small"
                            fullWidth
                            InputLabelProps={{shrink: true}}
                            sx={{my: 1.2}}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarMonthIcon sx={{color: "#4A90E2"}}/>
                                        </InputAdornment>
                                    )
                                } as never
                            }}
                        />

                        <MuiTelInput
                            className="mui-tel-input"
                            required
                            defaultCountry="RO"
                            placeholder="Enter phone number"
                            label="Phone Number"
                            value={formSignUp.phoneNumber}
                            onChange={(val) => setFormSignUp({ ...formSignUp, phoneNumber: val })}
                            name="phoneNumber"
                            size="small"
                            fullWidth
                            forceCallingCode
                            onBlur={() => setPhoneTouched(true)}
                            error={phoneTouched && !!formSignUp.phoneNumber && !isValidPhoneNumber(formSignUp.phoneNumber)}
                            helperText={
                                phoneTouched && !!formSignUp.phoneNumber && !isValidPhoneNumber(formSignUp.phoneNumber)
                                    ? "Invalid phone number"
                                    : ""
                            }
                            type="tel"
                            sx={{
                                '& .MuiTelInput-IconButton': { ml: '-7px' },
                            }}
                            // slotProps={{
                            //     input: {
                            //         startAdornment: (
                            //             <InputAdornment position="start">
                            //                 <PhoneIcon sx={{color: "#4A90E2"}}/>
                            //             </InputAdornment>
                            //         )
                            //     } as never
                            // }}
                        />

                        <TextField
                            label="Email"
                            value={formSignUp.email}
                            onChange={(e) => setFormSignUp({...formSignUp, email: e.target.value})}
                            name="email"
                            type="email"
                            required
                            size="small"
                            fullWidth
                            sx={{my: 1.2}}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountCircle sx={{color: "#4A90E2"}}/>
                                        </InputAdornment>
                                    )
                                } as never
                            }}
                        />

                        <TextField
                            label="Password"
                            value={formSignUp.password}
                            onChange={(e) => setFormSignUp({...formSignUp, password: e.target.value})}
                            name="password"
                            type={showPassword ? "text" : "password"}
                            size="small"
                            required
                            fullWidth
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                                sx={{color: "#4A90E2"}}
                                            >
                                                {showPassword ? <Visibility/> : <VisibilityOff/>}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                } as never,
                            }}
                        />

                        <FormControl fullWidth size="small" sx={{my: 1.2}} required>
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                label="Role"
                                value={formSignUp.role}
                                onChange={(e) =>
                                    setFormSignUp({
                                        ...formSignUp,
                                        role: Number(e.target.value) as UserEnumType,
                                    })
                                }
                            >
                                <MenuItem value={UserEnumType.Patient}>Patient</MenuItem>
                                <MenuItem value={UserEnumType.Doctor}>Doctor</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            disabled = {!isFormValid}
                            onClick={() => setContinueButton(true)}
                            type="button"
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{my: 2,
                                "&.Mui-disabled": {
                                    background: "linear-gradient(to right, #4facfe, #43e97b)",
                                    opacity: 0.5,      // scade intensitatea
                                    color: "#fff",
                                },}}
                            className="button-signup"

                        >
                            Continue
                        </Button>
                       <Typography sx={{ textAlign: "center", fontSize: "0.9rem", marginTop: -1.5, color: 'text.secondary'}}>
                           Already have an account? <Link className= "login-link" href="/login">Login</Link>
                       </Typography>
                     </>
                )}

                {continueButton && (
                    <>
                        <Box display="flex" alignItems="center" sx={{ width: "100%", position: "relative" }}>
                            <Button
                                onClick={() => setContinueButton(false)}
                                variant="outlined"
                                className="button-back"
                                startIcon={<ArrowBackIcon />}
                                sx={{ position: "absolute", left: 0 }}

                            >
                                Back
                            </Button>

                            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
                                <Typography variant="h6" gutterBottom noWrap>
                                    Final steps
                                </Typography>
                            </Box>
                        </Box>

                        {formSignUp.role === UserEnumType.Patient && (
                            <div className="form-fields">

                                <TextField
                                    label="CNP"
                                    required
                                    name="cnp"
                                    value={formSignUp.cnp}
                                    onChange={(e) =>
                                        setFormSignUp({...formSignUp, cnp: e.target.value})
                                    }
                                    fullWidth
                                    size="small"
                                    sx={{my: 1}}
                                />

                                <TextField
                                    label="Insurance Card Number (optional)"
                                    name="insuranceCardNumber"
                                    value={formSignUp.insuranceCardNumber}
                                    onChange={(e) =>
                                        setFormSignUp({
                                            ...formSignUp,
                                            insuranceCardNumber: e.target.value,
                                        })
                                    }
                                    fullWidth
                                    size="small"
                                    sx={{my: 1}}
                                />

                                <TextField
                                    label="Emergency Contact Name (optional)"
                                    name="emergencyContactName"
                                    value={formSignUp.emergencyContactName}
                                    onChange={(e) =>
                                        setFormSignUp({
                                            ...formSignUp,
                                            emergencyContactName: e.target.value,
                                        })
                                    }
                                    fullWidth
                                    size="small"
                                    sx={{my: 1}}
                                />

                                <TextField
                                    label="Emergency Contact Phone (optional)"
                                    name="emergencyContactPhone"
                                    type="tel"
                                    value={formSignUp.emergencyContactPhone}
                                    onChange={(e) =>
                                        setFormSignUp({
                                            ...formSignUp,
                                            emergencyContactPhone: e.target.value,
                                        })
                                    }
                                    fullWidth
                                    size="small"
                                    sx={{my: 1}}
                                />
                            </div>
                        )}

                        {formSignUp.role === UserEnumType.Doctor && (
                            <div className="form-fields">
                                <TextField
                                    label="Years of Experience"
                                    required
                                    name="yearsOfExperience"
                                    type="number"
                                    value={formSignUp.yearsOfExperience ?? ""}
                                    onChange={(e) =>
                                        setFormSignUp({
                                            ...formSignUp,
                                            yearsOfExperience: Number(e.target.value) || null,
                                        })
                                    }
                                    fullWidth
                                    size="small"
                                    sx={{my: 1}}
                                />

                                <TextField
                                    label="Medical License Number"
                                    required
                                    name="medicalLicenseNumber"
                                    value={formSignUp.medicalLicenseNumber}
                                    onChange={(e) =>
                                        setFormSignUp({
                                            ...formSignUp,
                                            medicalLicenseNumber: e.target.value,
                                        })
                                    }
                                    fullWidth
                                    size="small"
                                    sx={{my: 1}}
                                />

                                <TextField
                                    label="University Name"
                                    required
                                    name="universityName"
                                    value={formSignUp.universityName}
                                    onChange={(e) =>
                                        setFormSignUp({
                                            ...formSignUp,
                                            universityName: e.target.value,
                                        })
                                    }
                                    fullWidth
                                    size="small"
                                    sx={{my: 1}}
                                />
                                <TextField
                                    label="Institution code"
                                    name="institutionCode"
                                    type={"institutionCode"}
                                    value={formSignUp.institutionCode}
                                    onChange={(e) =>
                                        setFormSignUp({...formSignUp, institutionCode: e.target.value})
                                    }
                                    size="small"
                                    required
                                    fullWidth
                                    sx={{ my: 1.4,  "& .MuiOutlinedInput-root": {
                                            borderRadius: "12px"
                                        },
                                        "& .MuiFormLabel-asterisk": {
                                            color: "red",
                                        },}}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AccountBalanceIcon sx={{ color: "#4A90E2"}}/>
                                                </InputAdornment>
                                            ),
                                        } as never,
                                    }}
                                />


                            </div>
                        )}

                        <Button
                            // disabled={!isCnpValid}
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            className={`button-signup ${continueButton ? 'is-final' : 'is-initial'}`}
                            sx={{ my: 2,
                                "&.Mui-disabled": {
                                    background: "linear-gradient(to right, #4facfe, #43e97b)",
                                    opacity: 0.5,
                                    color: "#fff",
                                }, }}
                        >
                            Submit
                        </Button>

                    </>
                )}
                </form>
            </div>
        </>
    );
}