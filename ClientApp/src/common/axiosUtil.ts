import axios from "axios";
import type { AppDispatch, AppState } from "../store/store";
import GlobalSettings from '../GlobalSettings.json';

const axiosUtil = axios.create({
    baseURL: GlobalSettings.apiUrl,
});

let store: { getState: () => AppState; dispatch: AppDispatch } | null = null;
export const injectStore = (_store: { getState: () => AppState; dispatch: AppDispatch }) => {
    store = _store;
};

axiosUtil.interceptors.request.use(
    (config) => {
        const token = store?.getState().auth.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosUtil.interceptors.response.use(
    (response) => {
        if (response.status === 204) {
            return null;
        }
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401) {
            const { logout } = await import('../store/features/auth/authSlice');
            store?.dispatch(logout());
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosUtil;