'use client';

import React from 'react';
import { useMaintenance } from '@/core/context';
import { Button } from '@/shared/components/ui/Button';
import {
    Wrench,
    WifiOff,
    RefreshCw,
    Minimize2,
    Maximize2,
    ShieldAlert,
} from 'lucide-react';

export const ServerMaintenanceOverlay: React.FC = () => {
    const {
        isMaintenance,
        maintenanceType,
        message,
        isMinimized,
        isChecking,
        setIsMinimized,
        checkHealth,
    } = useMaintenance();

    if (!isMaintenance) return null;

    const isMaintenanceMode = maintenanceType === 'MAINTENANCE';

    // 1. Minimized Floating Banner (Draft Protection Mode)
    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="flex items-center gap-3 px-4 py-3 bg-secondary-1/95 dark:bg-dark-secondary-1/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl text-foreground max-w-md">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                        {isMaintenanceMode ? (
                            <Wrench className="w-5 h-5 animate-pulse" />
                        ) : (
                            <WifiOff className="w-5 h-5 text-destructive" />
                        )}
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                            {isMaintenanceMode
                                ? 'Hệ thống đang nâng cấp'
                                : 'Mất kết nối máy chủ'}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                            {message || 'Đang bảo trì định kỳ. Dữ liệu của bạn được bảo vệ.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={checkHealth}
                            disabled={isChecking}
                            className="rounded-xl cursor-pointer"
                            title="Thử lại ngay"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${
                                    isChecking ? 'animate-spin text-primary-2' : ''
                                }`}
                            />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => setIsMinimized(false)}
                            className="rounded-xl cursor-pointer"
                            title="Mở rộng thông báo"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Full Screen Design-Token Overlay
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 dark:bg-dark-primary-1/85 backdrop-blur-xl animate-in fade-in duration-300">
            {/* Background Glow Effects using handbook colors */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-2/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-lg p-8 bg-secondary-1 dark:bg-dark-secondary-1 border border-border rounded-3xl shadow-2xl text-foreground overflow-hidden text-center">
                {/* Header Toolbar (Minimize Button) */}
                <div className="flex justify-end mb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMinimized(true)}
                        className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Thu nhỏ để xem lại nội dung trang"
                    >
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Thu nhỏ thông báo</span>
                    </Button>
                </div>

                {/* Hero Icon Indicator */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-secondary-2/50 dark:bg-dark-secondary-2/60 border border-border shadow-inner group">
                    {isMaintenanceMode ? (
                        <Wrench className="w-10 h-10 text-amber-500 transition-transform duration-300 group-hover:rotate-12" />
                    ) : (
                        <WifiOff className="w-10 h-10 text-destructive transition-transform duration-300 group-hover:scale-110" />
                    )}

                    {/* Status Badge */}
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-background" />
                    </span>
                </div>

                {/* Title & Description */}
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                    {isMaintenanceMode
                        ? 'Máy chủ đang nâng cấp & bảo trì'
                        : 'Mất kết nối máy chủ'}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
                    {message ||
                        (isMaintenanceMode
                            ? 'Chúng tôi đang tiến hành nâng cấp hệ thống để mang lại trải nghiệm tốt hơn. Tính năng sẽ sẵn sàng trở lại trong ít phút!'
                            : 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại đường truyền mạng hoặc thử kết nối lại.')}
                </p>

                {/* Status Indicator Info Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-muted/60 border border-border rounded-full text-xs font-medium text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Tự động kiểm tra & khôi phục kết nối</span>
                </div>

                {/* Action Buttons using native Button component */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                        variant="primary"
                        size="md"
                        onClick={checkHealth}
                        disabled={isChecking}
                        className="w-full sm:w-auto gap-2 shadow-lg cursor-pointer"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${
                                isChecking ? 'animate-spin' : ''
                            }`}
                        />
                        <span>{isChecking ? 'Đang kiểm tra...' : 'Thử lại ngay'}</span>
                    </Button>

                    <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setIsMinimized(true)}
                        className="w-full sm:w-auto cursor-pointer"
                    >
                        <span>Xem trang hiện tại</span>
                    </Button>
                </div>

                {/* Draft Protection Tip Footer */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Dữ liệu soạn thảo dở của bạn vẫn được lưu an toàn tại trang này.</span>
                </div>
            </div>
        </div>
    );
};

export default ServerMaintenanceOverlay;
