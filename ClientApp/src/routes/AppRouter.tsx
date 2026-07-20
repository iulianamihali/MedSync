import Login from "../pages/login/Login.tsx";
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import SignUp from "../pages/signUp/SignUp.tsx";
import ApplicationLayout from "../pages/ApplicationLayout.tsx";
import RegisterInstitutionPage from "../pages/registerInstitution/RegisterInstitutionPage";
import ProtectedRoute from "./ProtectedRoute";
import UserEnumType from "../enums/UserEnumType";
import UnauthorizedPage from "../pages/unauthorized/UnauthorizedPage";
import InstitutionsPage from "../pages/institutions/InstitutionsPage";
import UsersPage from "../pages/users/UsersPage";
import SettingsPage from "../pages/settings/SettingsPage";
import DashboardRoleRouter from "../pages/dashboard/DashboardRoleRouter";
import AppointmentsCalendar from "../pages/appointments/AppointmentsCalendar";
import PatientsPage from "../pages/patients/PatientsPage";
import DoctorsPage from "../pages/doctors/DoctorsPage";
import ServicesPage from "../pages/services/ServicesPage";
import PatientDetailsPage from "../pages/patients/PatientDetailsPage";
import DoctorFeedbackPage from "../pages/feedback/DoctorFeedbackPage";
import MapComponent from "../pages/dashboard/dashboardPatient/mainGrid/map/MapComponent";
import InstitutionDetails from "../pages/institutions/institutionDetails/InstitutionDetails";
import AppointmentHistory from "../pages/patients/components/appHistory/AppointmentHistory";
import SharedMedicalHistoryPage from "../pages/shared/SharedMedicalHistoryPage";
import Caregiving from "../pages/careGiving/CareGiving";
import SupportIssuesPage from "../pages/supportIssues/supportPage/SupportIssuesPage";
import LandingPage from "../pages/landingPage/LandingPage";
import ResetPasswordPage from "../pages/reset-password/ResetPasswordPage";

export default function AppRouter () {

    return(
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/institution-request" element={<RegisterInstitutionPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/shared/:token" element={<SharedMedicalHistoryPage />} />
                <Route path="/landing-page" element={<LandingPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/"
                       element={
                    <ProtectedRoute allowedRoles={[
                        UserEnumType.GlobalAdmin,
                        UserEnumType.LocalAdmin,
                        UserEnumType.Doctor,
                        UserEnumType.Patient,
                    ]}>
                        <ApplicationLayout />
                    </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={<Navigate to="/dashboard" replace />}
                    />

                    <Route
                        path="dashboard"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.GlobalAdmin,
                                UserEnumType.LocalAdmin,
                                UserEnumType.Doctor,
                                UserEnumType.Patient,
                            ]}>
                                <DashboardRoleRouter />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="map"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.Patient
                            ]}>
                                <MapComponent />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="institutions"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.GlobalAdmin
                            ]}>
                                <InstitutionsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="users"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.GlobalAdmin
                            ]}>
                                <UsersPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="settings"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.GlobalAdmin,
                                UserEnumType.LocalAdmin,
                                UserEnumType.Doctor,
                                UserEnumType.Patient
                            ]}>
                                <SettingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="appointments"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.LocalAdmin,
                                UserEnumType.Doctor,
                            ]}>
                                <AppointmentsCalendar />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="patients"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.LocalAdmin,
                                UserEnumType.Doctor
                            ]}>
                                <PatientsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="feedback"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.Doctor
                            ]}>
                                <DoctorFeedbackPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="medical-history"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.Patient
                            ]}>
                                <AppointmentHistory />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="details-patients/:patientId"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.Doctor
                            ]}>
                                <PatientDetailsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="institutionDetails/:institutionId"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.Patient
                            ]}>
                                <InstitutionDetails />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="doctors"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.LocalAdmin
                            ]}>
                                <DoctorsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="services"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.LocalAdmin,
                                UserEnumType.Doctor
                            ]}>
                                <ServicesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="careGiving"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.Patient,
                            ]}>
                                <Caregiving />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="support"
                        element={
                            <ProtectedRoute allowedRoles={[
                                UserEnumType.GlobalAdmin,
                            ]}>
                                <SupportIssuesPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </Router>
    );

}