import './RegisterInstitutionPage.scss';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import RegisterForm from "./components/RegisterForm";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {useState} from "react";
import axiosUtil from "../../common/axiosUtil";
import GlobalSettings from '../../GlobalSettings.json';
import RegisterInstitutionEntity from "../../models/RegisterInstitutionEntity";

const steps = ['Register institution', 'Confirmation'];

export default function RegisterInstitutionPage() {
    const [activeStep, setActiveStep] = React.useState(0);
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [formRegisterInstitution, setFormRegisterInstitution] = useState<RegisterInstitutionEntity>(new RegisterInstitutionEntity());


    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const registerData: RegisterInstitutionEntity = {
                institutionName: formRegisterInstitution.institutionName,
                taxIdentificationNumber: formRegisterInstitution.taxIdentificationNumber,
                country: formRegisterInstitution.country,
                city: formRegisterInstitution.city,
                streetAddress: formRegisterInstitution.streetAddress,
                streetNumber: formRegisterInstitution.streetNumber,
                postalCode: formRegisterInstitution.postalCode,
                firstName: formRegisterInstitution.firstName,
                lastName: formRegisterInstitution.lastName,
                phoneNumber: formRegisterInstitution.phoneNumber,
                email: formRegisterInstitution.email,
                password: formRegisterInstitution.password
            }
            const url = `${GlobalSettings.institutionRoute}/registerInstitution`;
            const response = await axiosUtil.post(url, registerData)
            if (response.data)
                setActiveStep(activeStep + 1);
        }
        catch (e) {
            console.log(e);
        }
    }
    function getStepContent(step: number) {
        if (step === 0) {
            return <RegisterForm
                isFormValid={isFormValid}
                setIsFormValid={setIsFormValid}
                formRegisterInstitution={formRegisterInstitution}
                setFormRegisterInstitution={setFormRegisterInstitution}
            />;
        }
        throw new Error('Unknown step');
    }
    return (
        <div className="register-institution-page">
            <div className="logo-container">
                <img src="/assets/logo.png" className="logo"/>
            </div>

            <CssBaseline enableColorScheme />
            {/* Container pentru centrare */}
            <Container
                maxWidth="sm"
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    py: 3
                }}
            >
                {/* Paper pentru efectul de card încadrat */}
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, sm: 4 },
                        borderRadius: 2
                    }}
                >
                    {/* Titlu */}
                    <Typography
                        component="h1"
                        variant="h4"
                        align="center"
                        sx={{ mb: 4 }}
                    >
                       Institution Information
                    </Typography>

                    {/* Stepper */}
                    <Stepper activeStep={activeStep} sx={{ mb: 4,
                            '& .MuiStepIcon-root': {
                                color: 'grey.400',
                                '&.Mui-active': {
                                    color: '#4A90E2',
                                },
                                '&.Mui-completed': {
                                    color: '#4A90E2',
                                }}
                    }}>
                        {steps.map((label) => (
                            <Step key={label} >
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Conținutul formularului */}
                    {activeStep === 1 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h1" sx={{ mb: 2 }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: '6rem', color: '#22c55e ' }} />
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 2 }}>
                                Registration Submitted Successfully!
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                                Your institution registration is pending review.
                                You will receive an email notification once approved.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Form content */}
                            <Box sx={{ mb: 4 }}>
                                {getStepContent(activeStep)}
                            </Box>

                            {/* Navigation buttons */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: activeStep !== 0 ? 'space-between' : 'flex-end',
                                    mt: 3
                                }}
                            >
                                {activeStep !== 0 && (
                                    <Button
                                        startIcon={<ChevronLeftRoundedIcon />}
                                        onClick={handleBack}
                                        variant="outlined"
                                    >
                                        Previous
                                    </Button>
                                )}

                                <Button
                                    disabled={!isFormValid}
                                    variant="contained"
                                    endIcon={<ChevronRightRoundedIcon />}
                                    onClick={handleRegister}
                                    sx={{ borderRadius: 20, backgroundColor: '#4A90E2', '&:hover': { backgroundColor: '#357ABD' } }}
                                >
                                    SUBMIT
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Container>
        </div>
    );
}