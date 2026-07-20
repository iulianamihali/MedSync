import './InstitutionsPage.scss';
import CustomDataTable, {type PaginationDto} from "../../components/CustomDataTable";
import type {GridColDef} from "@mui/x-data-grid";
import {useEffect, useState} from "react";
import type {DataTableInstitutionsDto} from "./types";
import GlobalSettings from "../../GlobalSettings.json";
import axiosUtil from "../../common/axiosUtil";
import {Box} from "@mui/system";
import {Typography} from "@mui/material";
import DateTimeFormat from "../../common/dateTimeUtil";
import EditIcon from '@mui/icons-material/Edit';
import CustomPopUp from "../../components/CustomPopUp";
import EditInfoInstitutions from "./editInfoInstitutions/EditInfoInstitutions";
import EditInfoInstitutionsEntity from "../../models/EditInfoInstitutionsEntity";

const InstitutionsPage = () =>
{
    const [openEdit, setOpenEdit] = useState<boolean>(false);
    const [infoRowEdit, setInfoRowEdit] = useState<EditInfoInstitutionsEntity>(new EditInfoInstitutionsEntity());
    const [dataRows, setDataRows] = useState<PaginationDto<DataTableInstitutionsDto>>({
        rows: [],
        totalCount: 0,
    });
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        getData(0);
    },[])
    const getData = (page: number) => {
        const url = `${GlobalSettings.institutionRoute}/getDataTableInstitutions/${page}`;
        setLoading(true);
        axiosUtil.get<PaginationDto<DataTableInstitutionsDto>>(url)
            .then (res => {
                setDataRows(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }

    const editInfoInstitutions = () => {
        const url = `${GlobalSettings.institutionRoute}/updateInstitutionsInfo`;
        axiosUtil.put<boolean>(url, infoRowEdit)
            .then (res => {
                if(res.data)
                    getData(pageNumber);
            })
            .catch(err => {
                console.error(err);
            })

    }
    const columns: GridColDef[] = [
        {field: 'institutionName', headerName: 'Name', width: 180},
        {field: 'adminName', headerName: 'Admin', width: 200},
        {field: 'email', headerName: 'Email', width: 220},
        {field: 'phoneNumber', headerName: 'Phone Number', width: 156},
        {field: 'address', headerName: 'Address', width: 300},
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 170,
            valueGetter: (_, row: DataTableInstitutionsDto) => DateTimeFormat.dayMonthYearTimeFormat(row.createdAt),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 124,
            renderCell: (params) =>
                <div style={{
                    color: params.row.status ? 'green' : 'red',
                    fontWeight: 600
                }}>
                    {params.row.status ? 'Active' : 'Inactive'}
                </div>
        },
        {
            field: 'edit',
            headerName: 'Edit',
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <EditIcon
                        sx={{ cursor: 'pointer' }}
                        onClick={() =>{
                            setOpenEdit(true)
                            const e = new EditInfoInstitutionsEntity();
                            e.id = params.row.id;
                            e.institutionName = params.row.institutionName;
                            e.country = params.row.country;
                            e.city = params.row.city;
                            e.streetAddress = params.row.streetAddress;
                            e.streetNumber = params.row.streetNumber;
                            e.postalCode = params.row.postalCode;
                            e.status = params.row.status;
                            setInfoRowEdit(e);
                        }}
                    />
                </Box>

            ),
        },

    ];

    return (
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
                    Institutions
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
            <CustomPopUp
                open={openEdit}
                setOpen={setOpenEdit}
                title={"Edit Info"}
                contentComponent={EditInfoInstitutions}
                dataComponent={{
                    editInfoInstitutionsEntity: infoRowEdit,
                    setEditInfoInstitutionsEntity: setInfoRowEdit
                }}
                showActions={true}
                onClickCallback={editInfoInstitutions}
                textButton={"Save"}

            />
        </Box>
    );
}
export default InstitutionsPage;