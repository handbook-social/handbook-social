'use client';
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from 'react';
import { axiosAuth } from '@/core/api/axios-instance';

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
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [maintenanceType, setMaintenanceType] =
        useState<MaintenanceType>('MAINTENANCE');
    const [message, setMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const attemptsRef = useRef(0);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    const setMaintenanceMode = useCallback(
        (active: boolean, type: MaintenanceType = 'MAINTENANCE', msg?: string) => {
            setIsMaintenance(active);
            setMaintenanceType(type);
            if (msg) setMessage(msg);
            if (!active) {
                setIsMinimized(false);
                attemptsRef.current = 0;
            }
        },
        []
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

    // Smart Polling with Page Visibility API & Exponential Backoff
    useEffect(() => {
        if (!isMaintenance) {
            if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
            return;
        }

        const scheduleNextPoll = () => {
            // Pause polling if tab is in background (Visibility API)
            if (typeof document !== 'undefined' && document.hidden) {
                return;
            }

            // Cap at 30 attempts (~30 mins)
            if (attemptsRef.current >= 30) {
                return;
            }

            attemptsRef.current += 1;
            // Exponential backoff: 10s, 20s, 40s, capped at 60s
            const delay = Math.min(
                10000 * Math.pow(2, attemptsRef.current - 1),
                60000
            );

            timeoutIdRef.current = setTimeout(async () => {
                const healthy = await checkHealth();
                if (!healthy) {
                    scheduleNextPoll();
                }
            }, delay);
        };

        const handleVisibilityChange = () => {
            if (!document.hidden && isMaintenance) {
                // Instantly test health when returning to the tab
                checkHealth().then((healthy) => {
                    if (!healthy) {
                        attemptsRef.current = 0;
                        scheduleNextPoll();
                    }
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        scheduleNextPoll();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        };
    }, [isMaintenance, checkHealth]);

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
