import type {DashboardFilterState} from "../../models/DashboardFilterState";
import {DropDownFilterEnum} from "../../../enums/DropDownFilterEnum";
import dayjs from "dayjs";
import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import weekday from 'dayjs/plugin/weekday';

dayjs.extend(weekday)
const initialState:DashboardFilterState = {
    selectedPeriod: DropDownFilterEnum.ThisWeek,
    from: dayjs().weekday(1).startOf('day').toISOString(),
    to: dayjs().weekday(7).hour(23).minute(59).second(59).toISOString(),
};

const dashboardFilterSlice = createSlice({
    name: "dashboardFilter",
    initialState,
    reducers: {
        setSelectedPeriod (state: DashboardFilterState, action: PayloadAction<DropDownFilterEnum>) {
            state.selectedPeriod = action.payload;
        },
        setFrom (state: DashboardFilterState, action: PayloadAction<string>) {
            state.from = action.payload;
        },
        setTo (state: DashboardFilterState, action: PayloadAction<string>) {
            state.to = action.payload;
        },
        setDashboardFilter (state: DashboardFilterState, action: PayloadAction<DashboardFilterState>) {
            state.selectedPeriod = action.payload.selectedPeriod;
            state.from = action.payload.from;
            state.to = action.payload.to;
        }
    }
});

export const {setSelectedPeriod, setFrom, setTo, setDashboardFilter } = dashboardFilterSlice.actions;
export const dashboardFilterReducer = dashboardFilterSlice.reducer;