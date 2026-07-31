'use client';

import React from 'react';
import { useMaintenance } from '@/core/context';
import { Button } from '@/shared/components/ui/Button';
import {
    Wrench,
    WifiOff,
    RefreshCw,
    ShieldAlert,
    Lock,
} from 'lucide-react';

export default function MaintenancePage() {
    const {
        isMaintenance,
        maintenanceType,
        message,
        isChecking,
        checkHealth,
    } = useMaintenance();

    const isMaintenanceMode = maintenanceType === 'MAINTENANCE';

    return (
        <main className="min-h-screen w-full flex items-center justify-center p-4 bg-background dark:bg-dark-primary-1 text-foreground relative overflow-hidden select-none">
            {/* Ambient Lighting Background */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-2/10 dark:bg-primary-2/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-xl p-8 sm:p-10 bg-secondary-1 dark:bg-dark-secondary-1 border border-border rounded-3xl shadow-2xl text-center">
                {/* Lock Badge */}
                <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Trang tĩnh tự động khóa điều hướng</span>
                    </span>
                </div>

                {/* Hero Icon */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6 rounded-3xl bg-secondary-2/40 dark:bg-dark-secondary-2/60 border border-border shadow-inner group">
                    {isMaintenanceMode ? (
                        <Wrench className="w-12 h-12 text-amber-500 transition-transform duration-300 group-hover:rotate-12" />
                    ) : (
                        <WifiOff className="w-12 h-12 text-destructive transition-transform duration-300 group-hover:scale-110" />
                    )}

                    {/* Status Badge */}
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 border-2 border-background" />
                    </span>
                </div>

                {/* Title & Description */}
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                    {isMaintenanceMode
                        ? 'Máy chủ đang nâng cấp & bảo trì'
                        : 'Mất kết nối máy chủ'}
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">
                    {message ||
                        (isMaintenanceMode
                            ? 'Chúng tôi đang tiến hành nâng cấp hệ thống định kỳ để tối ưu hiệu năng. Tất cả các trang tạm thời bị đóng để bảo vệ dữ liệu của bạn.'
                            : 'Không thể kết nối tới máy chủ. Máy chủ hiện đang tạm đóng hoặc ngắt kết nối. Vui lòng quay lại sau ít phút.')}
                </p>

                {/* Live Status Indicator */}
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-muted/60 border border-border rounded-full text-xs font-medium text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Đang liên tục kiểm tra trạng thái máy chủ</span>
                </div>

                {/* Retry Button */}
                <div className="flex justify-center">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={checkHealth}
                        disabled={isChecking}
                        className="w-full sm:w-auto px-8 gap-2 shadow-lg cursor-pointer font-semibold"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${
                                isChecking ? 'animate-spin text-white' : ''
                            }`}
                        />
                        <span>{isChecking ? 'Đang kiểm tra máy chủ...' : 'Thử kết nối lại ngay'}</span>
                    </Button>
                </div>

                {/* Footer Notice */}
                <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Hệ thống sẽ tự động chuyển bạn về trang trước khi máy chủ hoạt động lại.</span>
                </div>
            </div>
        </main>
    );
}
