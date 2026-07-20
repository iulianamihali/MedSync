import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import DateTimeFormat from "../../../../../common/dateTimeUtil";
import type {DoctorReqPopUpResponseDto} from "./types";
import {useEffect, useState} from "react";
import GlobalSettings from "../../../../../GlobalSettings.json";
import axiosUtil from "../../../../../common/axiosUtil";
import {Button} from "@mui/material";
import useAuth from "../../../../../store/features/auth/authHook";


export default function ContentDoctorRequests() {
    const ins = useAuth().user?.ins;

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', width: 130 },
        { field: 'email', headerName: 'Email', width: 170 },
        { field: 'dateOfBirth', headerName: 'Date Of Birth', width: 130},
        { field: 'phoneNumber', headerName: 'Phone Number', width: 130 },
        { field: 'universityName', headerName: 'University name', width: 100 },
        { field: 'specialization', headerName: 'Specialization', width: 100 },
        { field: 'medicalLicenseNumber', headerName: 'Medical License Number', width: 100 },
        { field: 'yearsOfExperience', headerName: 'Years of experience', width: 100 },
        // {
        //     field: 'location',
        //     headerName: 'Location',
        //     sortable: false,
        //     width: 170,
        //     valueGetter: (_, row: InstitutionReqPopUpResponseDto) => `${row.country}, ${row.city}, ${row.streetAddress}, ${row.streetNumber}`,
        // },
        {
            field: 'createdAt',
            headerName: 'Created At',
            sortable: false,
            width: 180,
            valueGetter: (_, row: DoctorReqPopUpResponseDto) => DateTimeFormat.dayMonthYearTimeFormat(row.createdAt),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 178,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div>
                    {!params.row.actionType
                        ? <>
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
                                Approve
                            </Button>

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
                                Reject
                            </Button>
                        </>
                        : (
                            params.row.actionType === 'approve'
                                ? <div style={{color: '#22c55e'}}>Approved</div>
                                : <div style={{color: '#E57373'}}> Rejected </div>
                        )
                    }
                </div>

            ),
        },
    ];

    const [rows, setRows] = useState<DoctorReqPopUpResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if(ins)
            getData(ins);
    }, [ins])

    const handleButton = (id: string, value: boolean) => {
        const url = `${GlobalSettings.localAdminRoute}/updateDoctorRequest`;
        axiosUtil.put<boolean>(url,{
            id: id,
            value: value,
        })
            .then (res => {
                if (res.data)
                {
                    const tempRows = [...rows];
                    tempRows.forEach((row: DoctorReqPopUpResponseDto) => {
                        if (row.id === id)
                            row.actionType = value ? 'approve' : 'reject';
                    });
                    setRows(tempRows);
                }
            })
            .catch(err => {
                console.error(err);
            })

    }

    const getData = (institutionId: string) => {
        setIsLoading(true);
        const url = `${GlobalSettings.localAdminRoute}/getDoctorRequestDetails?institutionId=${institutionId}`;
        axiosUtil.get<DoctorReqPopUpResponseDto[]>(url)
            .then (res => {
                setRows(res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            })
    }

    return (
        <Paper sx={{ height: 400, width: '100%' }}>
            <DataGrid
                loading={isLoading}
                rows={rows}
                columns={columns}
                sx={{
                    border: 0,
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: '#f3f3f3',
                        color: '#333',
                        fontWeight: 'bold',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f3f3f3 !important',
                    },
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-cell:focus-within': {
                        outline: 'none',
                    },
                }}
                hideFooter
            />
        </Paper>
    );
}
