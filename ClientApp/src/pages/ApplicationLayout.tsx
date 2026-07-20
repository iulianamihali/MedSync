import Sidebar from "../layout/sidebar/Sidebar.tsx";
import {Outlet} from "react-router-dom";
import {useEffect, useState} from "react";
import AppNavbar from "../components/AppNavbar";
import AIFloating from "../components/AI/forPatient/AIFloating";
import useAuth from "../store/features/auth/authHook";
import verifyRole from "../utils/verifyRole";
import UserEnumType from "../enums/UserEnumType";
import DoctorAIFloating from "../components/AI/forDoctor/DoctorAIFloating";

const ApplicationLayout = () => {
    const role = useAuth()?.user?.role;
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(() => window.innerWidth < 960);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const width = isSmallScreen ? 0 : (isSidebarExpanded ? 184 : 60);

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 960);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return(
        <div style={{display: "flex", height: "100vh", overflow: "hidden"}}>
            <Sidebar isSidebarExpanded={isSidebarExpanded} setIsSidebarExpanded={setIsSidebarExpanded}
                     isSmallScreen={isSmallScreen} setIsSmallScreen={setIsSmallScreen}
                     isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen}
            />
            <main
                style={{
                    background: "white",
                    flex: 1,
                    padding: "0rem",
                    marginLeft: width,
                    transition: "margin-left 0.3s ease",
                    maxWidth: "100vw",
                    overflowX: "hidden",
                }}
            >
                <AppNavbar
                    onMenuClick={isSmallScreen ? () => setIsDrawerOpen(prev => !prev) : undefined}
                    isDrawerOpen={isDrawerOpen}
                />
                <Outlet/>
            </main>

            {verifyRole(UserEnumType.Patient, role) && <AIFloating />}
            {verifyRole(UserEnumType.Doctor, role) && <DoctorAIFloating />}


        </div>
    )
}

export default ApplicationLayout;