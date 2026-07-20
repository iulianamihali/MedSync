import {DataGrid, type GridColDef, type GridPaginationModel, type GridRowsProp} from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

export type Props = {
    columns: GridColDef[];
    rows: GridRowsProp;
    getData: (page: number) => void;
    rowCount: number;
    setPageNumberCallback: (page: number) => void;
    loading: boolean;
}

export type PaginationDto<T> = {
    rows: T[];
    totalCount: number;
}

export default function CustomDataTable(props: Props) {

    return (
        <Paper sx={{ height: 'calc(100vh - 140px)', width: '100%' }}>
            <DataGrid
                loading={props.loading}
                rows={props.rows}
                columns={props.columns}
                initialState={{ pagination: { paginationModel: {page: 0, pageSize: 9} } }}
                onPaginationModelChange={(model: GridPaginationModel) => {
                    props.setPageNumberCallback(model.page);
                    props.getData(model.page);
                }}
                rowCount={props.rowCount}
                paginationMode="server"
                sx={{ border: 0,
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: '#f3f3f3',
                        color: '#333',
                        fontWeight: 'bold',
                        outline: 'none',

                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f3f3f3 !important',
                        outline: 'none',
                    },
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-cell:focus-within': {
                        outline: 'none',
                    },
                }}
            />
        </Paper>
    );
}
