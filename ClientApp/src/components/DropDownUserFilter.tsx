import './styles/DropDownUserFilter.scss';
import {Box, FormControl, MenuItem, Select} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../store/hook";
import UserEnumType from "../enums/UserEnumType";
import {setSelectedUser} from "../store/features/user/userFilterSlice";
import {useMemo} from "react";
import useAuth from "../store/features/auth/authHook";
import verifyRole from "../utils/verifyRole";
import {userFilterValues} from "../enums/UserEnumType";

const DropDownUserFilter = () => {
    const dispatch = useAppDispatch();
    const selectedUser = useAppSelector(state => state.userFilter.selectedUser);
    const auth = useAuth();

    const values = useMemo(() => {
        //if the user has undefined role return empty
        if(!auth?.user?.role) return [];
        //get all the roles that are not equals with the current role from auth
        return userFilterValues.filter(x => !verifyRole(x.id, auth?.user?.role));
    },[auth?.user?.role]);

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2}}>

            <FormControl className="container" sx={{ minWidth: 150 }}>
                <Select
                    value={selectedUser}
                    onChange={(e) => {
                        dispatch(setSelectedUser(e.target.value as UserEnumType));
                    }}
                    className="custom-select"
                >
                    {
                        values.map((item) => (
                            <MenuItem key={item.id} value={item.id} className="custom-menu-item" >
                                {item.text}
                            </MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
        </Box>
    );
}
export default DropDownUserFilter;