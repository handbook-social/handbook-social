import { env } from '@/core/config/env.config';
import axios from 'axios';
import { triggerGlobalMaintenance } from '@/core/context/MaintenanceContext';

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

axiosAuth.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 503 ||
            error.response?.data?.code === 'SERVER_MAINTENANCE'
        ) {
            triggerGlobalMaintenance(
                true,
                'MAINTENANCE',
                error.response?.data?.message
            );
        } else if (
            !error.response &&
            error.config?.url !== '/health' &&
            (error.code === 'ERR_NETWORK' ||
                error.code === 'ECONNREFUSED' ||
                error.message?.includes('Network Error'))
        ) {
            triggerGlobalMaintenance(
                true,
                'NETWORK_ERROR',
                'Máy chủ hiện đang tạm đóng hoặc không thể kết nối. Vui lòng quay lại sau!'
            );
        }
        return Promise.reject(error);
    }
);

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

// Response interceptor: Handle 401, 503 maintenance, and network errors
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check for 503 Maintenance Mode
        if (
            error.response?.status === 503 ||
            error.response?.data?.code === 'SERVER_MAINTENANCE'
        ) {
            triggerGlobalMaintenance(
                true,
                'MAINTENANCE',
                error.response?.data?.message
            );
        } else if (
            !error.response &&
            (error.code === 'ERR_NETWORK' ||
                error.code === 'ECONNREFUSED' ||
                error.message?.includes('Network Error'))
        ) {
            if (originalRequest?.url !== '/health') {
                triggerGlobalMaintenance(
                    true,
                    'NETWORK_ERROR',
                    'Máy chủ hiện đang tạm đóng hoặc không thể kết nối. Vui lòng quay lại sau!'
                );
            }
        }

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
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
