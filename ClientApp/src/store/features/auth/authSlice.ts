import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import AuthStatusEnumType from "../../../enums/AuthStatusEnumType";
import type {AuthState} from "../../models/AuthState";

const initialState: AuthState = {
    accessToken: null,
    status: AuthStatusEnumType.Unknown,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login(state: AuthState, action: PayloadAction<string>) {
            state.accessToken = action.payload;
            state.status = AuthStatusEnumType.Authenticated;
        },
        logout(state: AuthState) {
            state.accessToken = null;
            state.status = AuthStatusEnumType.Unauthenticated;
        }
    }

})

export const {login, logout} = authSlice.actions;
export const authReducer = authSlice.reducer;
