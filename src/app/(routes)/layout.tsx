'use client';
import { ChatWithAI } from '@/features/ai';
import { ProtectedRoute } from '@/features/auth';
import { Navbar, BottomNavigation } from '@/shared/components/layout';
import { USER_ROLES } from '@/types/entites';
import { usePathname } from 'next/navigation';
import React from 'react';

interface Props {
    children: React.ReactNode;
}

const HomeLayout: React.FC<Props> = ({ children }) => {
    const pathname = usePathname();
    const isPublicRoute = pathname === '/';

    const layoutContent = (
        <div className="w-screen">
            <Navbar />

            <main className={'bg-primary-1 dark:bg-dark-primary-1 md:pb-0'}>
                {children}
            </main>

            <BottomNavigation />

            <ChatWithAI />
        </div>
    );

    if (isPublicRoute) {
        return layoutContent;
    }

    return (
        <ProtectedRoute requireRoles={[USER_ROLES.USER, USER_ROLES.ADMIN]} redirectTo="/">
            {layoutContent}
        </ProtectedRoute>
    );
};

export default HomeLayout;
