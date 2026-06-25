import { env } from '@/core/config/env.config';
import axios from 'axios';

let BASE_URL;

if (env.NODE_ENV === 'development') {
    BASE_URL = 'http://localhost:8000/api/v1';
} else {
    BASE_URL = env.NEXT_PUBLIC_SERVER_API;
}

// Main axios instance with interceptors
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Important: Send cookies for refresh token
});

// Simple axios instance without interceptors for auth initialization
export const axiosAuth = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

let accessTokenGetter: (() => string | null) | null = null;
let refreshTokenCallback: (() => Promise<void>) | null = null;
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Export function to set token getter from AuthContext
export const setAccessTokenGetter = (getter: () => string | null) => {
    accessTokenGetter = getter;
};

export const setRefreshTokenCallback = (callback: () => Promise<void>) => {
    refreshTokenCallback = callback;
};

// Request interceptor: Add access token
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined' && accessTokenGetter) {
            const token = accessTokenGetter();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and refresh token
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried and not the refresh endpoint
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/auth/refresh' &&
            originalRequest.url !== '/auth/login'
        ) {
            if (isRefreshing) {
                // Queue requests while refreshing
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                if (refreshTokenCallback) {
                    await refreshTokenCallback();
                    processQueue(null, null);
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Do not redirect to /auth/login here.
                // React-level ProtectedRoute will handle redirecting if the user is on a protected route.
                // This allows guests to stay on public routes (like the homepage '/') when refresh fails or on logout.
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
