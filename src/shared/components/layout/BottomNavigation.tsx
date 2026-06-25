'use client';

import { useAuth } from '@/core/context/AuthContext';
import { cn } from '@/lib/utils';
import { navbarLink } from '@/shared/constants';
import { USER_ROLES } from '@/types/entites';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

const BottomNavigation = () => {
    const { user, openLoginModal } = useAuth();
    const path = usePathname();
    const searchParams = useSearchParams();

    // Construct full path with query params if they exist
    const currentFullPath = searchParams.toString()
        ? `${path}?${searchParams.toString()}`
        : path;

    if (path.includes('/messages')) return null;

    return (
        <div className="fixed bottom-0 left-0 z-50 hidden h-[--navbar-height] w-full items-center justify-around border-t bg-white px-2 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] dark:bg-dark-secondary-1 md:flex">
            {navbarLink.map((link) => {
                if (
                    link.role === USER_ROLES.ADMIN &&
                    user?.role !== USER_ROLES.ADMIN
                )
                    return null;

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
                    else if (
                        path.startsWith(link.path + '/') &&
                        link.path !== '/'
                    ) {
                        isActived = true;
                    }
                }

                const Icon = () => {
                    return link.icon;
                };

                return (
                    <Link
                        key={link.name}
                        href={link.path || '/'}
                        onClick={(e) => {
                            if (!user && link.path !== '/') {
                                e.preventDefault();
                                openLoginModal();
                            }
                        }}
                        className={cn(
                            'flex flex-col items-center justify-center p-2 text-gray-500 transition-colors hover:text-blue dark:text-gray-400 dark:hover:text-blue',
                            {
                                'text-blue dark:text-blue': isActived,
                            }
                        )}
                    >
                        <div
                            className={cn('text-2xl', {
                                'text-blue': isActived,
                            })}
                        >
                            <Icon />
                        </div>
                        <span className="text-[10px] font-medium">
                            {link.name}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};

export default BottomNavigation;
