import './ServicesPage.scss';
import Box from "@mui/material/Box";
import MuiToolbar from "@mui/material/Toolbar";
import {
    Button,
    Divider,
    Fab,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import {useEffect, useState} from "react";
import GlobalSettings from "../../GlobalSettings.json";
import useAuth from "../../store/features/auth/authHook";
import axiosUtil from "../../common/axiosUtil";
import CustomPopUp from "../../components/CustomPopUp";
import AddSpecialtyServicesView, {type SelectOptionDto} from "./AddSpecialtyServicesView";
import {DeleteOutline, EditOutlined} from "@mui/icons-material";
import EditServiceView from "./EditServiceView";
import CircularProgress from "@mui/material/CircularProgress";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AddServicesToExistingSpecialtyView from "./AddServicesToExistingSpecialtyView";
import verifyRole from "../../utils/verifyRole";
import UserEnumType from "../../enums/UserEnumType";

export type SpecialtyServices = {
    specialtyId: string;
    specialtyName: string;
    institutionServices: InstitutionService[];
}
export type InstitutionService = {
    doctorSpecialtyId: string;
    id: string;
    serviceId: string;
    name: string;
    price: number;
    duration: number;
}
export interface EditDataDto extends InstitutionService {
    specialtyName: string;
}
export type ExistingSpecialtyServices = {
    specialtyId: string;
    specialtyName: string;
    selectedServices: string[];
}

export default function ServicesPage() {
    const ins = useAuth().user?.ins;
    const [specialtyServices, setSpecialtyServices] = useState<SpecialtyServices[]>([]);
    const [openAddModal, setOpenAddModal] = useState<boolean>(false);
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    const [editData, setEditData] = useState<EditDataDto>();
    const [loading, setLoading] = useState<boolean>(true);
    const [openAddServiceModal, setOpenAddServiceModal] = useState<boolean>(false);
    const [existingData, setExistingData] = useState<ExistingSpecialtyServices>();
    const [globalServices, setGlobalServices] = useState<SelectOptionDto[]>([]);
    const doctorId = useAuth().user?.sub;
    const role = useAuth().user?.role;
    const isLocalAdmin = verifyRole(UserEnumType.LocalAdmin, role);
    const isDoctor = verifyRole(UserEnumType.Doctor, role);
    const [specialtyServicesByDoctor, setSpecialtyServicesByDoctor] = useState<SpecialtyServices[]>([]);
    const [servicesByInstitution, setServicesByInstitution] = useState<SelectOptionDto[]>([]);


    const getSpecialtyServices = () => {
        const url = `${GlobalSettings.institutionRoute}/getSpecialtyServices/${ins}`;
        setLoading(true);
        axiosUtil.get<SpecialtyServices[]>(url)
            .then (res => {
                setSpecialtyServices(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }

    useEffect(() => {
        if (!ins) return;
        if(isLocalAdmin)
        {
            getSpecialtyServices();
            getServices();
        }

    },[ins])

    const getSpecialtyServicesByDoctor = (doctorId: string) => {
        const url = `${GlobalSettings.doctorRoute}/getSpecialtyServicesByDoctor/${doctorId}`;
        setLoading(true);
        axiosUtil.get<SpecialtyServices[]>(url)
            .then (res => {
                setSpecialtyServicesByDoctor(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }

    useEffect(() => {
        if (!doctorId) return;
        getSpecialtyServicesByDoctor(doctorId)
    },[doctorId])

    const editServiceData = () => {
        const url = `${GlobalSettings.institutionRoute}/editDataService`;
        const req = {
            institutionServiceId: editData?.id,
            price: editData?.price,
            duration: editData?.duration,
        }
        axiosUtil.put<boolean>(url, req)
            .then (res => {
                getSpecialtyServices();
            })
            .catch(err => {
                console.error(err);
            })
    }

    const deleteService = (institutionServiceId: string) => {
        const url = `${GlobalSettings.institutionRoute}/deleteService/${institutionServiceId}`;
        axiosUtil.delete<boolean>(url)
            .then (res => {
                getSpecialtyServices();
            })
            .catch(err => {
                console.error(err);
            })
    }

    const handleDeleteService = (doctorSpecialtyId: string) => {
        const url = `${GlobalSettings.doctorRoute}/deleteSpecialty`;
        axiosUtil.delete<boolean>(url, {
            data: [doctorSpecialtyId]
        })
            .then (res => {
                if(doctorId)
                    getSpecialtyServicesByDoctor(doctorId);
            })
            .catch(err => {
                console.error(err);
            })
    }
    const getServices = () => {
        const url = `${GlobalSettings.globalDataRoute}/getServices`;
        axiosUtil.get<SelectOptionDto[]>(url)
            .then (res => {
                setGlobalServices(res.data);
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
        getServicesByInstitution(ins);
    }, [ins]);

    const addServicesToExistingSpecialty = (services: SelectOptionDto[]) => {
        let url = "";
        if(isLocalAdmin)
            url = `${GlobalSettings.institutionRoute}/addService`;
        else
            url = `${GlobalSettings.doctorRoute}/addService`;

        const req = {
            institutionId: ins,
            specialtyId: existingData?.specialtyId,
            doctorId: doctorId,
            services: services.map(s => s.id),
        }
        axiosUtil.post<SelectOptionDto[]>(url, req)
            .then (res => {
                if(isLocalAdmin)
                    getSpecialtyServices();
                else
                    getSpecialtyServicesByDoctor(doctorId);
            })
            .catch(err => {
                console.error(err);
            })
    }

    const handleDeleteSpecialty = (specId: string) => {
        const url = `${GlobalSettings.institutionRoute}/deleteSpecialty`;
        axiosUtil.delete<boolean>(url, {
            data: {
                institutionId: ins,
                specialtyId: specId,
            }
        })
            .then (res => {
                getSpecialtyServices();
            })
            .catch(err => {
                console.error(err);
            })
    }

    const handleDeleteSpecialtyByDoctor = (specId: string) => {
        const specialty = specialtyServicesByDoctor.find((x)  => x.specialtyId === specId);
        const ids = specialty?.institutionServices.map((x) => x.doctorSpecialtyId);
        const url = `${GlobalSettings.doctorRoute}/deleteSpecialty`;
        axiosUtil.delete<boolean>(url, {
            data: ids
        })
            .then (res => {
                if(doctorId)
                    getSpecialtyServicesByDoctor(doctorId);
            })
            .catch(err => {
                console.error(err);
            })
    }

    const shouldShowEmptyBox =
        (isLocalAdmin && specialtyServices.length === 0) ||
        (isDoctor && specialtyServicesByDoctor.length === 0);

    const dataToRender = isLocalAdmin
        ? specialtyServices
        : specialtyServicesByDoctor;

    return (
        <>
        <Box
            sx={{
                width: "100%",
                maxWidth: { sm: "100%", md: "1700px" },
                px: { xs: 2, md: 3 },
                mx: "auto",
                boxSizing: "border-box",
            }}
        >
            <MuiToolbar disableGutters />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "sticky",
                    top: 64,
                    zIndex: 20,
                    backgroundColor: "white",
                    pb: 1,
                    boxShadow: "0 1px 0 rgba(0,0,0,0.08)",
                }}
            >
            <Typography
                variant="h6"
                component="h1"
                sx={{
                    fontWeight: 500,
                    fontSize: 24,
                }}
            >
                Services
            </Typography>
                <Fab
                    onClick={() => setOpenAddModal(true)}
                    size="small"
                    variant="extended"
                    sx={{
                        textTransform: "none",
                        backgroundColor: "#cbf3ea",
                        color: "#0F766E",
                        boxShadow: "none",
                        "&:hover": {
                            backgroundColor: "#D1FAF5",
                            boxShadow: "none",
                        },
                    }}
                >
                    <AddRoundedIcon />
                    <Box sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>
                        Add specialty
                    </Box>
                </Fab>
            </Box>

            {loading ? <CircularProgress className="circular-progress-main-grid"/>
                :

            (<Box sx={{marginTop: 5}}>
                {shouldShowEmptyBox ?
                    (
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                p: 6,
                                maxWidth: 640,
                                mx: "auto",
                                mt: 8,
                                textAlign: "center",
                                border: "1px dashed",
                                borderColor: "divider",
                                backgroundColor: "background.paper",
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, mb: 1 }}
                            >
                                No services configured yet
                            </Typography>

                            <Typography
                                sx={{
                                    color: "text.secondary",
                                    mb: 4,
                                    maxWidth: 420,
                                    mx: "auto",
                                }}
                            >
                                To start managing appointments, add the specialties and services your institution offers.
                            </Typography>

                            <Button
                                onClick={() => setOpenAddModal(true)}
                                variant="contained"
                                size="large"
                                sx={{
                                    textTransform: "none",
                                    px: 4,
                                    py: 1.2,
                                    borderRadius: 2,
                                }}
                            >
                                Add your first service
                            </Button>
                        </Paper>
                    )
                    :
                    (
                        dataToRender.map((spec) => (
                            <Paper
                                key={spec.specialtyId}
                                variant="outlined"
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                    p: 1.5,
                                    borderColor: "divider",
                                }}
                            >
                                <Box
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        mb: 1.5,
                                        borderRadius: 1,
                                        backgroundColor: "action.hover",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 500 }}>
                                        {spec.specialtyName}
                                        <Typography
                                            component="span"
                                            sx={{
                                                ml: 1,
                                                fontSize: 13,
                                                color: "text.secondary",
                                            }}
                                        >
                                            ({spec.institutionServices.length} services)
                                        </Typography>
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteOutline />}
                                        onClick={() => isLocalAdmin ? handleDeleteSpecialty(spec.specialtyId) : handleDeleteSpecialtyByDoctor(spec.specialtyId)}
                                        sx={{
                                            textTransform: "none",
                                            borderRadius: 2,
                                            px: 1.5,
                                            py: 0.6,
                                            fontWeight: 600,
                                            alignSelf: "flex-end",
                                            "&:hover": {
                                                bgcolor: "rgba(211,47,47,0.06)",
                                            },
                                        }}
                                    >
                                        Delete specialty
                                    </Button>

                                </Box>

                                <Divider sx={{ mb: 1 }} />

                                <TableContainer
                                    sx={{
                                        maxHeight: 300,
                                        overflowY: "auto",
                                    }}
                                >
                                <Table
                                    size="small"
                                    sx={{
                                        "& .MuiTableCell-root": {
                                            py: 0.6,
                                            px: 1.5,
                                        },
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: "28%", fontWeight: 500 }}>
                                                Service
                                            </TableCell>
                                            <TableCell align="left" sx={{ fontWeight: 500 }}>
                                                Price
                                            </TableCell>
                                            <TableCell align="left" sx={{ fontWeight: 500 }}>
                                                Duration
                                            </TableCell>
                                            <TableCell align="left" sx={{ width: 96, fontWeight: 500 }}>
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {spec.institutionServices.map((srv) => (
                                            <TableRow
                                                key={srv.id}
                                                hover
                                                sx={{
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        backgroundColor: "action.selected",
                                                    },
                                                }}
                                            >
                                                <TableCell sx={{ width: "28%" }}>
                                                    {srv.name}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {srv.price}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {srv.duration}
                                                </TableCell>
                                                <TableCell align="left">
                                                    <Box sx={{ gap: 1 }}>
                                                        {isLocalAdmin ?
                                                            <IconButton size="small" onClick={() =>
                                                        {
                                                            setEditData(
                                                                {
                                                                    specialtyName: spec.specialtyName,
                                                                    serviceId: srv.serviceId,
                                                                    doctorSpecialtyId: srv.doctorSpecialtyId,
                                                                    id: srv.id,
                                                                    name: srv.name,
                                                                    price: srv.price,
                                                                    duration: srv.duration
                                                                }
                                                            )
                                                            setOpenEditModal(true);
                                                        }}>
                                                            <EditOutlined fontSize="small" />
                                                        </IconButton>
                                                            : ""}

                                                        <IconButton size="small" color="error" onClick={() => isLocalAdmin ? deleteService(srv.id) : handleDeleteService(srv.doctorSpecialtyId)}>
                                                            <DeleteOutline fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                </TableContainer>
                                <Typography
                                    onClick={() => {
                                        setExistingData({
                                            specialtyId: spec.specialtyId,
                                            specialtyName: spec.specialtyName,
                                            selectedServices: spec.institutionServices.map(s => s.serviceId),
                                        })
                                        setOpenAddServiceModal(true)
                                    }}
                                    sx={{
                                        mt: 1.5,
                                        ml: 2,
                                        fontSize: 13,
                                        color: "primary.main",
                                        cursor: "pointer",
                                        width: "fit-content",
                                        "&:hover": {
                                            textDecoration: "underline",
                                        },
                                    }}
                                >
                                    + Add services
                                </Typography>
                            </Paper>
                        ))
                    )
                }
            </Box>
            )}
        </Box>
        <CustomPopUp
            open={openAddModal}
            setOpen={setOpenAddModal}
            title={"Add service"}
            contentComponent={AddSpecialtyServicesView}
            dataComponent={{specialtyServices: isLocalAdmin ? specialtyServices : specialtyServicesByDoctor}}
            showActions={false}
            onClickCallback={isLocalAdmin ? getSpecialtyServices : () => getSpecialtyServicesByDoctor(doctorId)}
            />
            <CustomPopUp
                open={openEditModal}
                setOpen={setOpenEditModal}
                title={"Edit service"}
                contentComponent={EditServiceView}
                dataComponent={{editData, setEditData}}
                showActions={true}
                textButton={"Edit"}
                onClickCallback={editServiceData}
            />
            <CustomPopUp
                open={openAddServiceModal}
                setOpen={setOpenAddServiceModal}
                title={"Add services"}
                contentComponent={AddServicesToExistingSpecialtyView}
                dataComponent={{existingData, setExistingData, allServices: isLocalAdmin ? globalServices : servicesByInstitution, onClickCallBack: addServicesToExistingSpecialty}}
                showActions={false}
                // textButton={"Edit"}
            />
        </>
    );
}
