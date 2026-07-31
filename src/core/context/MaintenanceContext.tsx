'use client';
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { axiosAuth } from '@/core/api/axios-instance';
import { env } from '@/core/config/env.config';

export type MaintenanceType = 'MAINTENANCE' | 'NETWORK_ERROR';

interface MaintenanceContextType {
    isMaintenance: boolean;
    maintenanceType: MaintenanceType;
    message: string;
    isMinimized: boolean;
    isChecking: boolean;
    setMaintenanceMode: (
        active: boolean,
        type?: MaintenanceType,
        msg?: string
    ) => void;
    setIsMinimized: (minimized: boolean) => void;
    checkHealth: () => Promise<boolean>;
}

const MaintenanceContext = createContext<MaintenanceContextType>({
    isMaintenance: false,
    maintenanceType: 'MAINTENANCE',
    message: '',
    isMinimized: false,
    isChecking: false,
    setMaintenanceMode: () => {},
    setIsMinimized: () => {},
    checkHealth: async () => false,
});

let globalMaintenanceTrigger:
    | ((active: boolean, type?: MaintenanceType, msg?: string) => void)
    | null = null;

export const triggerGlobalMaintenance = (
    active: boolean,
    type: MaintenanceType = 'MAINTENANCE',
    msg?: string
) => {
    if (globalMaintenanceTrigger) {
        globalMaintenanceTrigger(active, type, msg);
    }
};

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const isClientEnvMaintenance = env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

    const [isMaintenance, setIsMaintenance] = useState(isClientEnvMaintenance);
    const [maintenanceType, setMaintenanceType] =
        useState<MaintenanceType>('MAINTENANCE');
    const [message, setMessage] = useState(
        env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || ''
    );
    const [isMinimized, setIsMinimized] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const attemptsRef = useRef(0);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    const pathname = usePathname();
    const router = useRouter();

    // Auto-redirect to /maintenance and lock user from accessing other routes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (isMaintenance) {
            if (pathname !== '/maintenance') {
                sessionStorage.setItem('maintenance_redirect_back', pathname);
                router.replace('/maintenance');
            }
        } else {
            if (pathname === '/maintenance') {
                const redirectBack =
                    sessionStorage.getItem('maintenance_redirect_back') || '/';
                sessionStorage.removeItem('maintenance_redirect_back');
                router.replace(redirectBack);
            }
        }
    }, [isMaintenance, pathname, router]);

    const setMaintenanceMode = useCallback(
        (active: boolean, type: MaintenanceType = 'MAINTENANCE', msg?: string) => {
            const nextActive = isClientEnvMaintenance || active;
            setIsMaintenance(nextActive);
            setMaintenanceType(type);
            if (msg || env.NEXT_PUBLIC_MAINTENANCE_MESSAGE) {
                setMessage(msg || env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || '');
            }
            if (!nextActive) {
                setIsMinimized(false);
                attemptsRef.current = 0;
            }
        },
        [isClientEnvMaintenance]
    );

    useEffect(() => {
        globalMaintenanceTrigger = setMaintenanceMode;
        return () => {
            globalMaintenanceTrigger = null;
        };
    }, [setMaintenanceMode]);

    const checkHealth = useCallback(async (): Promise<boolean> => {
        setIsChecking(true);
        try {
            // Send health check request directly bypassing interceptors
            const res = await axiosAuth.get('/health', { timeout: 5000 });
            if (res.status === 200 && res.data?.success) {
                setMaintenanceMode(false);
                setIsChecking(false);
                return true;
            }
        } catch {
            // Health check failed; maintain state
        }
        setIsChecking(false);
        return false;
    }, [setMaintenanceMode]);

    return (
        <MaintenanceContext.Provider
            value={{
                isMaintenance,
                maintenanceType,
                message,
                isMinimized,
                isChecking,
                setMaintenanceMode,
                setIsMinimized,
                checkHealth,
            }}
        >
            {children}
        </MaintenanceContext.Provider>
    );
};

export const useMaintenance = () => useContext(MaintenanceContext);
