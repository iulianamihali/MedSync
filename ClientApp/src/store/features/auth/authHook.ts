import AuthStatusEnumType from "../../../enums/AuthStatusEnumType";
import {useAppSelector} from "../../hook";
import {decodeJwt} from "../../../utils/jwt";

export interface DecodedJwt {
    sub: string;
    email: string;
    name: string;
    role: string;
    ins?: string;
    exp: number;
    iss?: string;
    aud?: string;
}

export interface AuthResult {
    isAuthenticated: boolean;
    user: DecodedJwt | null;
}

const useAuth= ():AuthResult => {
    // const accessToken = useSelector((state: AppState) => state.auth.accessToken);
    // const status = useSelector((state: AppState) => state.auth.status);
    const accessToken = useAppSelector(state => state.auth.accessToken);
    const status = useAppSelector(state => state.auth.status);
    const isAuthenticated = !!accessToken && status === AuthStatusEnumType.Authenticated; //add also the expire condition when will be available refresh token

    if(!isAuthenticated) {
        return {
            isAuthenticated: false,
            user: null,
        };
    }

    const rawDecoded: any = decodeJwt(accessToken);
    if (!rawDecoded) {
        return {
            isAuthenticated: false,
            user: null,
        };
    }

    const normalizedRole: string =
        rawDecoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
        rawDecoded.role ??
        "";

    const user: DecodedJwt = {
        sub: rawDecoded.sub,
        email: rawDecoded.email,
        name: rawDecoded.name,
        role: normalizedRole,
        ins: rawDecoded.ins,
        exp: rawDecoded.exp,
        iss: rawDecoded.iss,
        aud: rawDecoded.aud,
    };

    return {
        isAuthenticated: true,
        user,
    };
};

export default useAuth;