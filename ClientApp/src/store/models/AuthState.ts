import type AuthStatusEnumType from "../../enums/AuthStatusEnumType.ts";

export interface AuthState {
    accessToken: string | null;
    status: AuthStatusEnumType;
}