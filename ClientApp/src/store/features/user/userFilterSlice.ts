import type {UserFilterState} from "../../models/UserFilterState";
import UserEnumType from "../../../enums/UserEnumType";
import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

const initialState:  UserFilterState = {
    selectedUser: UserEnumType.LocalAdmin,
};

const userFilterSlice = createSlice({
    name: "userFilter",
    initialState,
    reducers: {
        setSelectedUser (state: UserFilterState, action: PayloadAction<UserEnumType>) {
            state.selectedUser = action.payload;
        },
    }
});

export const {setSelectedUser} = userFilterSlice.actions;
export const userFilterReducer = userFilterSlice.reducer;