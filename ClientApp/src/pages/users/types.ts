import type UserEnumType from "../../enums/UserEnumType";

export type DataTableUsersDto = {
    id: string;
    userName: string;
    role: UserEnumType;
    institutionName: string;
    createdAt: string;
    status: boolean;
}