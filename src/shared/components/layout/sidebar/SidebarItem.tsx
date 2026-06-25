'use client';

import { cn } from '@/lib/utils';
import { UserRole, USER_ROLES } from '@/types/entites';
import { useAuth } from '@/core/context';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSidebarCollapse } from '@/core/context/SidebarContext';

interface SidebarItemProps {
    link: {
        name: string;
        path: string;
        icon: React.ReactNode;
        role?: UserRole;
    };
}

const SidebarItem: React.FC<SidebarItemProps> = ({ link }) => {
    const { user, openLoginModal } = useAuth();
    const path = usePathname();
    const { isSidebarOpen, setIsSidebarOpen } = useSidebarCollapse();
    const searchParams = useSearchParams();

    // Construct full path with query params if they exist
    const currentFullPath = searchParams.toString()
        ? `${path}?${searchParams.toString()}`
        : path;

    // Calculate active state
    let isActived = false;

    // 1. Strict exact match (covers queries)
    if (currentFullPath === link.path) {
        isActived = true;
    }
    // 2. Parent path match (only if link has no query params)
    else if (!link.path.includes('?')) {
        // If paths match exactly but step 1 failed, it means query params differ.
        // We treat this as NOT active (user requirement).
        if (path === link.path) {
            isActived = false;
        }
        // Handle nested routes (e.g. /groups -> /groups/123)
        // Ensure boundary check with '/' to avoid false positives like /group -> /groups
        else if (path.startsWith(link.path + '/') && link.path !== '/') {
            isActived = true;
        }
    }

    if (link.role === USER_ROLES.ADMIN && user?.role !== USER_ROLES.ADMIN)
        return null;

    return (
        <li
            className={cn(
                `flex w-full cursor-pointer items-center rounded-xl p-2 hover:bg-hover-2 dark:hover:bg-dark-hover-1`
            )}
        >
            <Link
                className={cn(
                    'flex h-full w-full items-center justify-start dark:text-dark-primary-1',
                    {
                        'text-blue dark:text-blue': isActived,
                    }
                )}
                href={link.path || '/'}
                onClick={(e) => {
                    if (isSidebarOpen) {
                        setIsSidebarOpen(false);
                    }
                    if (!user && link.path !== '/') {
                        e.preventDefault();
                        openLoginModal();
                    }
                }}
            >
                <div className="flex h-8 w-8 items-center justify-center">
                    {link.icon}
                </div>

                <span className="ml-2 text-xs">{link.name}</span>
            </Link>
        </li>
    );
};

export default SidebarItem;
