import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import {TextField} from "@mui/material";
import {isValidPhoneNumber} from "react-phone-number-input";
import {useEffect, useState} from "react";
import {MuiTelInput} from "mui-tel-input";
import RegisterInstitutionEntity from "../../../models/RegisterInstitutionEntity";

const FormGrid = styled(Grid)(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

export type Props = {
    isFormValid: boolean;
    setIsFormValid: (isFormValid: boolean) => void;
    formRegisterInstitution: RegisterInstitutionEntity;
    setFormRegisterInstitution: (formRegisterInstitution: RegisterInstitutionEntity) => void;
}

export default function RegisterForm(props: Props) {
    const [touched, setTouched] = useState(false);

    useEffect (() => {
        const isFormValid = !!(
            props.formRegisterInstitution.institutionName &&
            props.formRegisterInstitution.taxIdentificationNumber &&
            props.formRegisterInstitution.country &&
            props.formRegisterInstitution.city &&
            props.formRegisterInstitution.streetAddress &&
            props.formRegisterInstitution.streetNumber &&
            props.formRegisterInstitution.postalCode &&
            props.formRegisterInstitution.firstName &&
            props.formRegisterInstitution.lastName &&
            props.formRegisterInstitution.phoneNumber &&
            props.formRegisterInstitution.password);
        props.setIsFormValid(isFormValid);
    }, [props?.formRegisterInstitution])


    return (
        <Grid container spacing={3}>
            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="institution-name"
                    value={props.formRegisterInstitution.institutionName}
                    onChange={(e) => props.setFormRegisterInstitution({...props.formRegisterInstitution, institutionName: e.target.value})}
                    name="institutionName"
                    label="Institution name"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="organization"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="taxIdentificationNumber"
                    value={props.formRegisterInstitution.taxIdentificationNumber}
                    onChange={(e) =>
                        props.setFormRegisterInstitution({
                            ...props.formRegisterInstitution,
                            taxIdentificationNumber: e.target.value,
                        })
                    }
                    name="taxIdentificationNumber"
                    label="Tax Identification Number"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="organization"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="country"
                    value={props.formRegisterInstitution.country}
                    onChange={(e) => props.setFormRegisterInstitution({...props.formRegisterInstitution, country: e.target.value})}
                    name="country"
                    label="Country"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="country"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="city"
                    value={props.formRegisterInstitution.city}
                    onChange={(e) => props.setFormRegisterInstitution({...props.formRegisterInstitution, city: e.target.value})}
                    name="city"
                    label="City"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="address-level2"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="address"
                    value={props.formRegisterInstitution.streetAddress}
                    onChange={(e) => props.setFormRegisterInstitution({...props.formRegisterInstitution, streetAddress: e.target.value})}
                    name="address"
                    label="Address"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="street-address"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="streetNumber"
                    value={props.formRegisterInstitution.streetNumber}
                    onChange={(e) => props.setFormRegisterInstitution({...props.formRegisterInstitution, streetNumber: e.target.value})}
                    name="streetNumber"
                    label="Number"
                    variant="standard"
                    required
                    fullWidth
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="postalCode"
                    value={props.formRegisterInstitution.postalCode}
                    onChange={(e) => props.setFormRegisterInstitution({...props.formRegisterInstitution, postalCode: e.target.value})}
                    name="postalCode"
                    label="Zip / Postal code"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="postal-code"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="first-name"
                    value={props.formRegisterInstitution.firstName}
                    onChange={(e) => props.setFormRegisterInstitution({...props.formRegisterInstitution, firstName: e.target.value})}
                    name="firstName"
                    label="First name"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="name"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="last-name"
                    value={props.formRegisterInstitution.lastName}
                    onChange={(e) => props.setFormRegisterInstitution({...props.formRegisterInstitution, lastName: e.target.value})}
                    name="lastName"
                    label="Last name"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="name"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <MuiTelInput
                    label="Phone"
                    variant="standard"
                    required
                    fullWidth
                    defaultCountry="RO"
                    forceCallingCode
                    value={props.formRegisterInstitution.phoneNumber}
                    onChange={(value) => props.setFormRegisterInstitution({
                        ...props.formRegisterInstitution,
                        phoneNumber: value
                    })}                    onBlur={() => setTouched(true)}
                    error={touched && !!props.formRegisterInstitution.phoneNumber && !isValidPhoneNumber(props.formRegisterInstitution.phoneNumber)}
                    helperText={touched && !!props.formRegisterInstitution.phoneNumber && !isValidPhoneNumber(props.formRegisterInstitution.phoneNumber) ? 'Invalid phone number' : ''}
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="email"
                    value={props.formRegisterInstitution.email}
                    onChange={(e) => props.setFormRegisterInstitution({...props.formRegisterInstitution, email: e.target.value})}
                    name="email"
                    label="Email"
                    type="email"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="email"
                />
            </FormGrid>
            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="password"
                    value={props.formRegisterInstitution.password}
                    onChange={(e) => props.setFormRegisterInstitution({...props.formRegisterInstitution, password: e.target.value})}
                    name="password"
                    label="Password"
                    type="password"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="new-password"
                />
            </FormGrid>

        </Grid>
    );
}