'use client';

import React from 'react';
import { useMaintenance } from '@/core/context';
import { CheckCircle2 } from 'lucide-react';

/**
 * Custom SVG Illustration matching the modern minimalist crane & browser design.
 */
function MaintenanceIllustration({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 600 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Background Clouds */}
            <path
                d="M200 85C200 76.7157 206.716 70 215 70C218.423 70 221.573 71.1479 224.1 73.0854C226.797 65.4191 234.07 60 242.5 60C252.717 60 261 68.2827 261 78.5C261 79.5441 260.914 80.568 260.75 81.5649C265.529 83.2796 269 87.8427 269 93.2C269 99.7169 263.717 105 257.2 105H215C206.716 105 200 98.2843 200 90V85Z"
                className="fill-indigo-100/70 dark:fill-indigo-950/40"
            />
            <path
                d="M420 100C420 93.3726 425.373 88 432 88C434.738 88 437.258 88.9184 439.28 90.4683C441.438 84.3353 447.256 80 454 80C462.284 80 469 86.7157 469 95C469 95.842 468.931 96.6677 468.8 97.4719C472.623 98.8548 475.4 102.505 475.4 106.8C475.4 112.019 471.173 116.25 465.96 116.25H432C425.373 116.25 420 110.877 420 104.25V100Z"
                className="fill-indigo-100/50 dark:fill-indigo-950/30"
            />

            {/* Base Ground Line */}
            <line
                x1="150"
                y1="270"
                x2="550"
                y2="270"
                className="stroke-slate-300 dark:stroke-slate-700"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* --- CENTRAL BROWSER WINDOW --- */}
            <g transform="translate(205, 125)">
                {/* Outer Frame */}
                <rect
                    x="0"
                    y="0"
                    width="170"
                    height="140"
                    rx="8"
                    className="fill-white dark:fill-slate-900 stroke-indigo-400 dark:stroke-indigo-600"
                    strokeWidth="2.5"
                />
                {/* Header Bar */}
                <path
                    d="M0 8C0 3.58172 3.58172 0 8 0H162C166.418 0 170 3.58172 170 8V24H0V8Z"
                    className="fill-indigo-50 dark:fill-slate-800 border-b border-indigo-200"
                />
                {/* Window Dots */}
                <circle cx="10" cy="12" r="2.5" fill="#EF4444" />
                <circle cx="18" cy="12" r="2.5" fill="#F59E0B" />
                <circle cx="26" cy="12" r="2.5" fill="#10B981" />
                <rect x="40" y="8" width="80" height="8" rx="4" fill="#E2E8F0" className="dark:fill-slate-700" />

                {/* Left Card 1 */}
                <rect x="14" y="36" width="56" height="42" rx="4" className="fill-indigo-300/80 dark:fill-indigo-600/60" />

                {/* Left Card 2 */}
                <rect x="14" y="86" width="56" height="42" rx="4" className="fill-indigo-300/80 dark:fill-indigo-600/60" />

                {/* Right Placeholder Text Lines */}
                <rect x="80" y="86" width="50" height="6" rx="3" fill="#C7D2FE" className="dark:fill-slate-700" />
                <rect x="80" y="98" width="70" height="6" rx="3" fill="#E0E7FF" className="dark:fill-slate-800" />
                <rect x="80" y="110" width="40" height="6" rx="3" fill="#E0E7FF" className="dark:fill-slate-800" />

                {/* Tilted Card Being Lowered by Crane */}
                <g transform="translate(74, 38) rotate(6)">
                    <rect
                        x="0"
                        y="0"
                        width="68"
                        height="44"
                        rx="4"
                        className="fill-indigo-400 dark:fill-indigo-500 shadow-md"
                    />
                    {/* Cable Connection Point */}
                    <circle cx="34" cy="0" r="3" fill="#F97316" />
                </g>
            </g>

            {/* --- CONSTRUCTION CRANE --- */}
            <g transform="translate(365, 75)">
                {/* Crane Base Stand */}
                <path d="M60 195 L40 195 L45 185 L55 185 Z" className="fill-slate-600 dark:fill-slate-400" />
                <rect x="42" y="185" width="16" height="10" className="fill-slate-700 dark:fill-slate-500" />

                {/* Vertical Tower (Truss Structure) */}
                <rect x="46" y="20" width="8" height="165" className="fill-slate-400 dark:fill-slate-600" />
                {/* Diagonal Lattice Lines */}
                <path
                    d="M46 25 L54 35 M54 35 L46 45 M46 45 L54 55 M54 55 L46 65 M46 65 L54 75 M54 75 L46 85 M46 85 L54 95 M54 95 L46 105 M46 105 L54 115 M54 115 L46 125 M46 125 L54 135 M54 135 L46 145 M46 145 L54 155 M54 155 L46 165"
                    stroke="#94A3B8"
                    strokeWidth="1.2"
                />

                {/* Horizontal Arm (Jib) */}
                <path d="M-30 20 L110 20 L100 12 L-20 12 Z" className="fill-slate-300 dark:fill-slate-500" stroke="#64748B" strokeWidth="1" />
                <path d="M-30 20 L-20 12 M-10 20 L0 12 M10 20 L20 12 M30 20 L40 12 M50 20 L60 12 M70 20 L80 12 M90 20 L100 12" stroke="#64748B" strokeWidth="1" />

                {/* Tower Apex / Top Cap */}
                <path d="M46 12 L50 0 L54 12 Z" className="fill-slate-500 dark:fill-slate-400" />
                <line x1="50" y1="0" x2="-20" y2="12" stroke="#64748B" strokeWidth="1.2" />
                <line x1="50" y1="0" x2="100" y2="12" stroke="#64748B" strokeWidth="1.2" />

                {/* Counterweight Block (Orange) */}
                <rect x="75" y="14" width="30" height="14" rx="2" fill="#F97316" />
                <rect x="79" y="14" width="22" height="14" fill="#EA580C" />

                {/* Cable Trolley & Wire Hanging Down to Browser Card */}
                <rect x="2" y="18" width="8" height="6" rx="1" fill="#F97316" />
                <line x1="6" y1="24" x2="6" y2="92" stroke="#F97316" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx="6" cy="92" r="3" fill="#EA580C" />
            </g>

            {/* --- LEFT CONSTRUCTION BARRICADE --- */}
            <g transform="translate(160, 220)">
                <rect x="8" y="30" width="4" height="20" fill="#64748B" />
                <rect x="36" y="30" width="4" height="20" fill="#64748B" />
                <rect x="0" y="10" width="48" height="18" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                {/* Diagonal Orange Stripes */}
                <path d="M8 10 L0 28 M20 10 L12 28 M32 10 L24 28 M44 10 L36 28" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* --- RIGHT CONSTRUCTION BARRICADE --- */}
            <g transform="translate(490, 220)">
                <rect x="8" y="30" width="4" height="20" fill="#64748B" />
                <rect x="36" y="30" width="4" height="20" fill="#64748B" />
                <rect x="0" y="10" width="48" height="18" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                {/* Diagonal Orange Stripes */}
                <path d="M8 10 L0 28 M20 10 L12 28 M32 10 L24 28 M44 10 L36 28" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* --- TRAFFIC CONE --- */}
            <g transform="translate(225, 242)">
                <ellipse cx="12" cy="26" rx="14" ry="4" fill="#EA580C" />
                <path d="M5 24 L9 4 L15 4 L19 24 Z" fill="#F97316" />
                <path d="M7 17 L17 17 L16 12 L8 12 Z" fill="#FFFFFF" />
            </g>
        </svg>
    );
}

export default function MaintenancePage() {
    const { message } = useMaintenance();

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background dark:bg-dark-primary-1 text-foreground relative selection:bg-indigo-500/20 select-none">
            <div className="w-full max-w-2xl text-center flex flex-col items-center justify-center my-auto">
                {/* Custom Vector Illustration */}
                <MaintenanceIllustration className="w-full max-w-md sm:max-w-lg h-auto mb-8 transition-transform hover:scale-[1.01] duration-300" />

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-4 font-sans">
                    Hệ Thống Đang Bảo Trì Nâng Cấp
                </h1>

                {/* Subtitle Message */}
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mb-4">
                    {message ||
                        'Thành thật xin lỗi vì sự bất tiện này! Máy chủ Handbook đang thực hiện bảo trì định kỳ để nâng cấp và tối ưu hóa hệ thống. Chúng tôi sẽ quay trở lại hoạt động trong ít phút nữa.'}
                </p>
            </div>

            {/* Footer */}
            <footer className="w-full max-w-md text-center text-xs text-muted-foreground py-4 border-t border-border mt-auto flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Handbook &bull; System Maintenance</span>
            </footer>
        </main>
    );
}
