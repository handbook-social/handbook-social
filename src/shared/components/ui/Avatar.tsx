'use client';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '@/core/context/AuthContext';

interface User {
    id: string;
    name: string;
    avatar?: string;
    image?: string;
}

interface Props {
    className?: string;
    user?: User;
    userUrl?: string;
    imgSrc?: string;
    width?: number;
    height?: number;
    fill?: boolean;
    alt?: string;
    href?: string;
    rounded?: string;
    onlyImage?: boolean;
}

const Avatar: React.FC<Props> = ({
    className,
    user,
    imgSrc,
    userUrl,
    alt,
    width = 32,
    height = 32,
    fill = false,
    href,
    rounded = 'full',
    onlyImage = false,
}) => {
    const { user: currentUser, openLoginModal } = useAuth();

    const userId = user?.id || userUrl;
    const userImage = user?.avatar || user?.image || imgSrc;
    const userName = user?.name || alt;

    const isUser = !!userId;
    const [isError, setIsError] = useState<boolean>(false);
    const sizeProps = fill
        ? { fill: true }
        : {
              width: width,
              height: height,
          };

    if (onlyImage) {
        return (
            <Image
                className={cn(`rounded-${rounded}`, className)}
                src={
                    isError
                        ? '/assets/img/user-profile.jpg'
                        : userImage || '/assets/img/user-profile.jpg'
                }
                alt={userName || ''}
                priority={true}
                onError={() => setIsError(true)}
                {...sizeProps}
            />
        );
    }

    return (
        <Link
            className={cn(className)}
            href={(isUser && `/profile/${userId}`) || (href && href) || ''}
            onClick={(e) => {
                if (!currentUser) {
                    e.preventDefault();
                    e.stopPropagation();
                    openLoginModal();
                }
            }}
        >
            <Image
                className={cn(`rounded-${rounded}`, className)}
                src={
                    isError
                        ? '/assets/img/user-profile.jpg'
                        : userImage || '/assets/img/user-profile.jpg'
                }
                alt={userName || ''}
                priority={true}
                onError={() => setIsError(true)}
                {...sizeProps}
            />
        </Link>
    );
};

export const SkeletonAvatar: React.FC<Props> = ({
    className,
    width = 40,
    height = 40,
    rounded = 'full',
}) => {
    return (
        <div
            className={cn(
                'animate-pulse bg-gray-300 dark:bg-gray-600',
                `rounded-${rounded}`,
                className
            )}
            style={{ width: width, height: height }}
        ></div>
    );
};

export default Avatar;
