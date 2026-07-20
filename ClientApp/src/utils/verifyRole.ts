import  UserEnumType from "../enums/UserEnumType";

const verifyRole = (role: UserEnumType, stringRole: string | undefined) => {
    return UserEnumType[role].toLowerCase() === stringRole?.toLowerCase();
}
export default verifyRole;