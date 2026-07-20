import {jwtDecode} from "jwt-decode";
import type {DecodedJwt} from "../store/features/auth/authHook";

export const decodeJwt = (token: string): DecodedJwt | null => {
    try {
        return jwtDecode<DecodedJwt>(token);
    } catch {
        return null;
    }
};
