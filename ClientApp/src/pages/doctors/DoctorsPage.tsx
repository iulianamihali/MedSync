import {Button, Typography} from "@mui/material";
import {Box} from "@mui/system";
import type {GridColDef} from "@mui/x-data-grid";
import {useEffect, useState} from "react";
import CustomDataTable, {type PaginationDto} from "../../components/CustomDataTable";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import useAuth from "../../store/features/auth/authHook";
import DateTimeFormat from "../../common/dateTimeUtil";

type DataTableDoctorsDto = {
    id: string;
    doctorName: string;
    phoneNumber: string;
    createdAt: string;
    specialization: string;
    yearsOfExperience: number;
    status: boolean;
}

const DoctorsPage = () => {
    const auth = useAuth();
    const ins = auth.user?.ins;
    const [dataRows, setDataRows] = useState<PaginationDto<DataTableDoctorsDto>>({
        rows: [],
        totalCount: 0,
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [pageNumber, setPageNumber] = useState<number>(0);
    useEffect(() => {
        getData(0);
    },[])
    const getData = (page: number) => {
        const url = `${GlobalSettings.institutionRoute}/getDataTableDoctors/${page}/${ins}`;
        setLoading(true);
        axiosUtil.get<PaginationDto<DataTableDoctorsDto>>(url)
            .then (res => {
                setDataRows(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }

    const columns: GridColDef[] = [
        {field: 'doctorName', headerName: 'Name', width: 300},
        {field: 'phoneNumber', headerName: 'Phone Number', width: 180 },
        {field: 'specialization', headerName: 'Specialization', width: 270 },
        {field: 'yearsOfExperience', headerName: 'Years of experience', width: 190},
        {field: 'createdAt',
            headerName: 'Account created',
            width: 200,
            valueFormatter: (value) => {
                if (!value) return '-';
                return DateTimeFormat.dayMonthYearFormat(value as string);
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 108,
            renderCell: (params) =>
                <div style={{
                    color: params.row.status ? 'green' : 'red',
                    fontWeight: 600
                }}>
                    {params.row.status ? 'Active' : 'Inactive'}
                </div>
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const isActive = params.row.status === true;
                return (
                    <div>
                        {!isActive
                            ?
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleButton(params.row.id, true)}
                                sx={{
                                    backgroundColor: '#22c55e',
                                    '&:hover': { backgroundColor: '#45A049' },
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                    padding: '4px 10px',
                                    marginRight: '5px',
                                }}
                            >
                                Active
                            </Button>
                            :
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleButton(params.row.id, false)}
                                sx={{
                                    backgroundColor: '#E57373',
                                    '&:hover': { backgroundColor: '#EF5350' },
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                    padding: '4px 10px',
                                }}
                            >
                                Inactive
                            </Button>
                        }
                    </div>
                );
            }},
    ];

    const handleButton = (id: string, value: boolean) => {
        const url = `${GlobalSettings.userRoute}/updateUserStatus`;
        axiosUtil.put<boolean>(url,{
            id: id,
            value: value,
        })
            .then (res => {
                if (res.data)
                {
                    const tempRows = [...dataRows.rows];
                    tempRows.forEach((row: DataTableDoctorsDto) => {
                        if (row.id === id)
                            row.status = value;
                    });
                    setDataRows({...dataRows, rows: tempRows});
                }
            })
            .catch(err => {
                console.error(err);
            })

    }

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
                    Doctors
                </Typography>
            </Box>
            <Box>
                <CustomDataTable
                    columns={columns}
                    rows={dataRows.rows}
                    getData={getData}
                    rowCount={dataRows.totalCount}
                    setPageNumberCallback={setPageNumber}
                    loading={loading}
                />
            </Box>
        </Box>
    );
}

export default DoctorsPage;