import './styles/DropDownFilter.scss';
import {useEffect, useMemo} from "react";
import {Box, FormControl, MenuItem, Select} from "@mui/material";
import {DropDownFilterEnum, dropDownFilterValues} from "../enums/DropDownFilterEnum";
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {useAppDispatch, useAppSelector} from "../store/hook";
import {setFrom, setSelectedPeriod, setTo} from "../store/features/dashboard/dashboardFilterSlice";
import verifyRole from "../utils/verifyRole";
import useAuth from "../store/features/auth/authHook";
import UserEnumType from "../enums/UserEnumType";

const DropDownFilter = () => {
    const dispatch = useAppDispatch();
    const selectedPeriod = useAppSelector(state => state.dashboardFilter.selectedPeriod);
    const from = useAppSelector(state => dayjs(state.dashboardFilter.from));
    const to = useAppSelector(state => dayjs(state.dashboardFilter.to));
    const auth = useAuth();

    if(verifyRole(UserEnumType.Patient, auth?.user?.role)) {
        return ;
    }
    const values = useMemo(() => {
        //if the user has undefined role return empty
        if(!auth?.user?.role) return [];
        //get all the roles that are not equals with the current role from auth
        let temp = [...dropDownFilterValues];
        if(verifyRole(UserEnumType.GlobalAdmin, auth?.user?.role))
        {
            temp = temp.filter(x => x.id != DropDownFilterEnum.Today);
        }
        return temp;
    },[auth?.user?.role]);

    useEffect (() => {
        if(selectedPeriod !== DropDownFilterEnum.Custom)
            setDateRange(selectedPeriod);
    }, [selectedPeriod]);

    const setDateRange = (filter: DropDownFilterEnum) => {
        const now = new Date();
        switch (filter) {
            case DropDownFilterEnum.Today: {
                const from = new Date();
                from.setHours(0,0,0,0);
                const to = new Date();
                to.setHours(23, 59, 59, 999);
                dispatch(setFrom(from.toISOString()));
                dispatch(setTo(to.toISOString()));
                break;
            }

            case DropDownFilterEnum.ThisWeek: {
                const today = new Date();
                const day = today.getDay();
                const daysSinceMonday = (day + 6) % 7;
                const from = new Date(today);
                from.setDate(today.getDate() - daysSinceMonday);
                from.setHours(0, 0, 0, 0);
                const to = new Date();
                to.setHours(23, 59, 59, 999);
                dispatch(setFrom(from.toISOString()));
                dispatch(setTo(to.toISOString()));
                break;
            }

            case DropDownFilterEnum.LastWeek: {
                const today = new Date();
                const day = today.getDay();
                const daysSinceMonday = (day + 6) % 7;
                const from = new Date(today);
                from.setDate(today.getDate() - daysSinceMonday - 7);
                from.setHours(0, 0, 0, 0);
                const to = new Date(from);
                to.setDate(from.getDate() + 6);
                to.setHours(23, 59, 59, 999);
                dispatch(setFrom(from.toISOString()));
                dispatch(setTo(to.toISOString()));
                break;
            }

            case DropDownFilterEnum.NextWeek: {
                const today = new Date();
                const day = today.getDay();
                const daysSinceMonday = (day + 6) % 7;
                const from = new Date(today);
                from.setDate(today.getDate() - daysSinceMonday + 7);
                from.setHours(0, 0, 0, 0);
                const to = new Date(from);
                to.setDate(from.getDate() + 6);
                to.setHours(23, 59, 59, 999);
                dispatch(setFrom(from.toISOString()));
                dispatch(setTo(to.toISOString()));
                break;
            }

            case DropDownFilterEnum.ThisMonth: {
                const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                const to = new Date();
                to.setHours(23, 59, 59, 999);
                dispatch(setFrom(from.toISOString()));
                dispatch(setTo(to.toISOString()));
                break;
            }

            case DropDownFilterEnum.LastMonth: {
                const from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
                const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                dispatch(setFrom(from.toISOString()));
                dispatch(setTo(to.toISOString()));
                break;
            }

            case DropDownFilterEnum.ThisYear: {
                const from = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
                const to = new Date();
                to.setHours(23, 59, 59, 999);
                dispatch(setFrom(from.toISOString()));
                dispatch(setTo(to.toISOString()));
                break;
            }

            case DropDownFilterEnum.LastYear: {
                const from = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
                const to = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
                dispatch(setFrom(from.toISOString()));
                dispatch(setTo(to.toISOString()));
                break;
            }

            case DropDownFilterEnum.Custom: {
                break;
            }

            default:
                throw new Error("Invalid filter");
        }
    };


    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2}}>

            {selectedPeriod === DropDownFilterEnum.Custom ? (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: 'flex', gap: 2}}>
                        <DatePicker
                            className="date-picker"
                            label="From"
                            value={from}
                            onChange={(newValue) => {
                                if(newValue !== null)
                                    dispatch(setFrom(newValue.toISOString()));
                            }}
                            maxDate={to}
                        />
                        <DatePicker
                            className="date-picker"
                            label="To"
                            value={to}
                            onChange={(newValue) => {
                                if(newValue !== null)
                                    dispatch(setTo(newValue.toISOString()));

                            }}
                            minDate={from}
                            maxDate={dayjs(new Date())}
                        />
                    </Box>
                </LocalizationProvider>
            ):null}
            <FormControl className="container" sx={{ minWidth: 150 }}>
                <Select
                    value={selectedPeriod}
                    onChange={(e) => {
                        dispatch(setSelectedPeriod(e.target.value as DropDownFilterEnum));
                    }}
                    className="custom-select"
                >

                    {values.map((x) => (
                        <MenuItem key={x.id} value={x.id} className="custom-menu-item">
                            {x.text}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}
export default DropDownFilter;