import { useEffect, useState } from "react";
import {Box, MenuItem, Typography} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import type {SupportIssuesEnumType} from "../../../enums/SupportIssuesEnumType";
import type {StatusSupportEnumType} from "../../../enums/StatusSupportEnumType";
import axiosUtil from "../../../common/axiosUtil";
import GlobalSettings from "../../../GlobalSettings.json";
import {supportIssuesTranslations} from "../../dashboard/dashboardAdminGlobal/mainGrid/Utils";
import CustomDataTable, {type PaginationDto} from "../../../components/CustomDataTable";
import DateTimeFormat from "../../../common/dateTimeUtil";
import UserEnumType from "../../../enums/UserEnumType";
import Select from "@mui/material/Select";

export type SupportIssueResponseDto = {
    id: string;
    userRole: number;
    type: SupportIssuesEnumType;
    description: string;
    createdAt: string;
    status: StatusSupportEnumType;
};

const statusConfig: Record<number, { label: string; color: string }> = {
    0: { label: 'Pending',     color: '#f59e0b' },
    1: { label: 'In Progress', color: '#3b82f6' },
    2: { label: 'Resolved',    color: '#10b981' },
};

const userTypeTranslations: Record<number, string> = {
    [UserEnumType.GlobalAdmin]: 'Global Admin',
    [UserEnumType.LocalAdmin]: 'Local Admin',
    [UserEnumType.Doctor]: 'Doctor',
    [UserEnumType.Patient]: 'Patient',
};

const SupportIssuesPage = () => {

    const [dataRows, setDataRows] = useState<PaginationDto<SupportIssueResponseDto>>({
        rows: [],
        totalCount: 0,
    });
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        getData(0);
    }, []);

    const getData = (page: number) => {
        const url = `${GlobalSettings.supportIssues}/getSupportIssues/${page}`;
        setLoading(true);
        axiosUtil.get<PaginationDto<SupportIssueResponseDto>>(url)
            .then(res => {
                setDataRows(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const updateStatus = (id: string, status: number) => {
        const url = `${GlobalSettings.supportIssues}/updateStatus?id=${id}&status=${status}`;
        axiosUtil.patch(url, {})
            .then(() => getData(pageNumber))
            .catch(err => console.error(err));
    };

    const columns: GridColDef[] = [
        { field: 'userRole', headerName: 'Role', width: 180,
            valueGetter: (_: any, row: SupportIssueResponseDto) => userTypeTranslations[row.userRole],
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 300,
            valueGetter: (_: any, row: SupportIssueResponseDto) => supportIssuesTranslations[row.type],
        },
        { field: 'description', headerName: 'Description', width: 380 },
        {
            field: 'createdAt',
            headerName: 'Date',
            width: 168,
            valueGetter: (_: any, row: SupportIssueResponseDto) => DateTimeFormat.dayMonthYearTimeFormat(row.createdAt),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 200,
            renderCell: (params) => {
                const { label, color } = statusConfig[params.row.status];
                return <span style={{ color, fontWeight: 600 }}>{label}</span>;
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <Select
                    value={params.row.status}
                    size="small"
                    onChange={(e) => updateStatus(params.row.id, Number(e.target.value))}
                    sx={{
                        fontSize: '0.8rem',
                        borderRadius: 2,
                        height: 32,
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: statusConfig[params.row.status].color,
                        },
                        color: statusConfig[params.row.status].color,
                        fontWeight: 600,
                    }}
                >
                    <MenuItem value={0} sx={{ color: '#f59e0b', fontWeight: 600 }}>Pending</MenuItem>
                    <MenuItem value={1} sx={{ color: '#3b82f6', fontWeight: 600 }}>In Progress</MenuItem>
                    <MenuItem value={2} sx={{ color: '#10b981', fontWeight: 600 }}>Resolved</MenuItem>
                </Select>
            ),
        }
    ];

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: { sm: '100%', md: '1700px' },
                mt: 7,
                px: 3,
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
                        fontSize: 24,
                    }}
                >
                    Support issues
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
};

export default SupportIssuesPage;