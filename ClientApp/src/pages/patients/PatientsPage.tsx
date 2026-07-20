import {IconButton, Tooltip, Typography} from "@mui/material";
import {Box} from "@mui/system";
import type {GridColDef} from "@mui/x-data-grid";
import {useEffect, useMemo, useState} from "react";
import DateTimeFormat from "../../common/dateTimeUtil";
import CustomDataTable, {type PaginationDto} from "../../components/CustomDataTable";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import useAuth from "../../store/features/auth/authHook";
import verifyRole from "../../utils/verifyRole";
import UserEnumType from "../../enums/UserEnumType";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import {useNavigate} from "react-router-dom";

type DataTablePatientsDto = {
    id: string;
    patientName: string;
    address: string;
    phoneNumber: string;
    dateOfBirth: string;
    visits: number;
    lastVisit: string;
}

const PatientsPage = () => {
    const auth = useAuth();
    const ins = auth.user?.ins;
    const role = auth?.user?.role;
    const doctorId = auth?.user?.sub;
    const [loading, setLoading] = useState<boolean>(false);
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [searchText, setSearchText] = useState<string>("");
    const navigate = useNavigate();

    const [dataRows, setDataRows] = useState<PaginationDto<DataTablePatientsDto>>({
        rows: [],
        totalCount: 0,
    });
    const [dataRowsDoctor, setDataRowsDoctor] = useState<PaginationDto<DataTablePatientsDto>>({
        rows: [],
        totalCount: 0,
    });

    const filteredRows = useMemo(() => {
        if (!searchText) {
            return dataRowsDoctor.rows;
        }

        return dataRowsDoctor.rows.filter(row =>
            row.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
            row.phoneNumber.includes(searchText)
        );
    }, [searchText, dataRowsDoctor.rows]);

    const getData = (page: number) => {
        const url = `${GlobalSettings.institutionRoute}/getDataTablePatients/${page}/${ins}`;
        setLoading(true);
        axiosUtil.get<PaginationDto<DataTablePatientsDto>>(url)
            .then (res => {
                setDataRows(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }

    const getDataForDoctor = (page: number) => {
        const url = `${GlobalSettings.doctorRoute}/getDataTableMyPatients/${page}/${ins}/${doctorId}`;
        setLoading(true);
        axiosUtil.get<PaginationDto<DataTablePatientsDto>>(url)
            .then (res => {
                setDataRowsDoctor(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }

    useEffect(() => {
        if(verifyRole(UserEnumType.LocalAdmin, role))
            getData(0);
        else if(verifyRole(UserEnumType.Doctor, role))
            getDataForDoctor(0);
    },[role])

    const columns: GridColDef[] = [
        {field: 'patientName', headerName: 'Name', width: verifyRole(UserEnumType.LocalAdmin, role) ? 300 : verifyRole(UserEnumType.Doctor, role) ? 230 : 0},
        {field: 'address', headerName: 'Address', width: 300},
        {field: 'phoneNumber', headerName: 'Phone Number', width: verifyRole(UserEnumType.LocalAdmin, role) ? 260 : verifyRole(UserEnumType.Doctor, role) ? 190 : 0},
        {field: 'dateOfBirth', headerName: 'Date Of Birth', width: 190},
        {field: 'visits', headerName: 'Visits', width: 170},
        {field: 'lastVisit',
            headerName: 'Last visit',
            width: 208,
            valueFormatter: (value) => {
                if (!value) return '-';
                return DateTimeFormat.dayMonthYearFormat(value as string) + " " + DateTimeFormat.timeFormat(value as string);
            }
        },
        ...(verifyRole(UserEnumType.Doctor, role)
            ? [
                {
                    field: 'actions',
                    headerName: 'View',
                    width: 140,
                    sortable: false,
                    filterable: false,
                    align: 'center',
                    headerAlign: 'center',
                    renderCell: (params) => (
                        <Tooltip title="View patient details">
                            <IconButton
                                size="small"
                                sx={{
                                    color: '#1976d2',
                                    '&:hover': {
                                        backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                    }
                                }}
                                onClick={() => navigate(`/details-patients/${params.row.id}`)}
                            >
                                <VisibilityOutlinedIcon />
                            </IconButton>
                        </Tooltip>
                    )

                } as GridColDef
            ]
            : [])

    ];

    return(
        <Box
            sx={{
                width: '100%',
                maxWidth: { sm: '100%', md: '1700px' },
                mt: 7,
                px:3,
                boxSizing: 'border-box',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                }}
            >
                <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                        color: 'text.primary',
                        fontWeight: 500,
                        fontSize: 24
                    }}
                >
                    Patients
                </Typography>
                <TextField
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search patient"
                    variant="standard"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                >
                </TextField>

            </Box>
            <Box>
                {verifyRole(UserEnumType.LocalAdmin, role)
                    ?
                <CustomDataTable
                    columns={columns}
                    rows={dataRows.rows}
                    getData={getData}
                    rowCount={dataRows.totalCount}
                    setPageNumberCallback={setPageNumber}
                    loading={loading}
                />
                    :
                    <CustomDataTable
                        columns={columns}
                        rows={filteredRows}
                        getData={getDataForDoctor}
                        rowCount={dataRowsDoctor.totalCount}
                        setPageNumberCallback={setPageNumber}
                        loading={loading}
                    />
                }

            </Box>
        </Box>
    );
}

export default PatientsPage;