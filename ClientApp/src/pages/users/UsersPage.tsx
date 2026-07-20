import {Typography} from "@mui/material";
import {Box} from "@mui/system";
import type {GridColDef} from "@mui/x-data-grid";
import type {DataTableUsersDto} from "./types";
import {useEffect, useState} from "react";
import DateTimeFormat from "../../common/dateTimeUtil";
import CustomDataTable, {type PaginationDto} from "../../components/CustomDataTable";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import {useAppSelector} from "../../store/hook";
import {Button} from "@mui/material";
import {userFilterValues} from "../../enums/UserEnumType";

const UsersPage = () => {
    const selectedUser = useAppSelector(state => state.userFilter.selectedUser);
    const [dataRows, setDataRows] = useState<PaginationDto<DataTableUsersDto>>({
        rows: [],
        totalCount: 0,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [pageNumber, setPageNumber] = useState<number>(0);
    useEffect(() => {
        getData(0);
    },[])
    useEffect(() => {
        getData(pageNumber);
    },[selectedUser])
    const getData = (page: number) => {
        const url = `${GlobalSettings.userRoute}/getDataTableUsers/${page}/${selectedUser}`;
        setLoading(true);
        axiosUtil.get<PaginationDto<DataTableUsersDto>>(url)
            .then (res => {
                setDataRows(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }
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
                    tempRows.forEach((row: DataTableUsersDto) => {
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

    const columns: GridColDef[] = [
        {field: 'userName', headerName: 'Name', width: 280},
        {field: 'role',
            headerName: 'Role',
            width: 220,
            renderCell: (params) => {
                const role = userFilterValues.find(x => x.id == params.row.role);
                return (<div>{role.text}</div>);
            }
        },
        {field: 'institutionName', headerName: 'Institution', width: 280},
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 290,
            valueGetter: (_, row: DataTableUsersDto) => DateTimeFormat.dayMonthYearTimeFormat(row.createdAt),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 220,
            renderCell: (params) => {
                const isActive = params.row.status === true;
                return (
                    <div style={{
                    color: isActive ? 'green' : 'red',
                    fontWeight: 600
                }}>
                    {isActive ? 'Active' : 'Inactive'}
                    </div>
                );

        }},
        {
            field: 'actions',
            headerName: 'Actions',
            width: 130,
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
                    Users
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
export default UsersPage;