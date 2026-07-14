import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

// Request Interceptor: to put Bearer token
api.interceptors.request.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const logout = useAuthStore.getState().logout;
            logout();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;