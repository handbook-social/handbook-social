'use client';
import { SkeletonAvatar } from '@/shared/components/ui/Avatar';
import { Button } from '@/shared/components/ui/Button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/components/ui/Popover';
import { useAuth } from '@/core/context/AuthContext';
import { useLogout } from '@/features/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Icons from '../ui/Icons';
import { INavbarUserMenu, navbarUserMenu } from '@/shared/constants';

const NavbarUser = () => {
    const { user, isLoading } = useAuth();
    const logoutMutation = useLogout();
    const router = useRouter();

    const [menuStack, setMenuStack] = useState<INavbarUserMenu[][]>([
        navbarUserMenu,
    ]);

    const currentMenu = menuStack[menuStack.length - 1];
    const currentTitle =
        menuStack.length > 1
            ? (menuStack[menuStack.length - 2].find(
                  (item) => item.children === currentMenu
              )?.title as string)
            : 'Menu';
    const isRootMenu = menuStack.length === 1;

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
            router.push('/');
        } catch (error) {
            // Error already handled in hook
        }
    };

    const handleBack = () => {
        // Để quay lại, chỉ cần xóa phần tử cuối cùng của stack
        setMenuStack((prev) => prev.slice(0, prev.length - 1));
    };

    const handleClosePopover = () => {
        // Reset stack về trạng thái ban đầu khi popover đóng
        setTimeout(() => setMenuStack([navbarUserMenu]), 150);
    };

    if (isLoading) {
        return <SkeletonAvatar />;
    }

    if (!user) {
        return (
            <Link href="/auth/login">
                <Button size="sm" variant="primary" className="h-9 font-medium px-4 rounded-xl">
                    Đăng nhập
                </Button>
            </Link>
        );
    }

    return (
        <Popover onOpenChange={(isOpen) => !isOpen && handleClosePopover()}>
            <PopoverTrigger className={'ml-2 flex items-center'}>
                <Image
                    className="cursor-pointer rounded-full"
                    width={40}
                    height={40}
                    src={user.avatar || ''}
                    alt="Your profile picture"
                    referrerPolicy="no-referrer"
                />
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-2">
                <div className="relative flex flex-col">
                    <div className="flex w-full items-center pb-2">
                        {!isRootMenu && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-8 w-8 rounded-full"
                                    onClick={handleBack}
                                >
                                    <Icons.ArrowLeft className="text-lg" />
                                </Button>
                                <span className="text-xl font-bold">
                                    {currentTitle}
                                </span>
                            </>
                        )}
                    </div>

                    <ul className="flex flex-col">
                        {isRootMenu && (
                            <Link
                                className="flex w-full items-center rounded-xl p-2 shadow-md hover:bg-hover-2 dark:text-dark-primary-1 dark:hover:bg-dark-hover-1"
                                href={`/profile/${user.id}`}
                            >
                                <div className="h-9 w-9 object-cover">
                                    <Image
                                        className="rounded-full"
                                        width={40}
                                        height={40}
                                        src={user?.avatar || ''}
                                        alt={user?.name || ''}
                                    />
                                </div>
                                <span className="ml-2">{user?.name}</span>
                            </Link>
                        )}

                        {currentMenu.map((item) => {
                            const handleClick = () => {
                                if (item.action) {
                                    item.action();
                                }
                                if (item.children) {
                                    setMenuStack((prev) => [
                                        ...prev,
                                        item.children as INavbarUserMenu[],
                                    ]);
                                }
                            };

                            if (item.render) {
                                return (
                                    <li key={item.title}>
                                        <Button
                                            variant="ghost"
                                            className="h-13 relative flex w-full cursor-pointer items-center justify-between rounded-lg p-2 text-left"
                                            onClick={handleClick}
                                        >
                                            <div className="flex items-center gap-2">
                                                {item.icon && (
                                                    <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-hover-2 text-xl dark:bg-dark-hover-1">
                                                        {item.icon()}
                                                    </span>
                                                )}
                                                <span className="text-sm font-medium">
                                                    {item.title}
                                                </span>
                                            </div>
                                            <span className="flex h-9 items-center text-sm font-medium">
                                                {item.render()}
                                            </span>
                                        </Button>
                                    </li>
                                );
                            }

                            return (
                                <li key={item.title}>
                                    <Button
                                        variant="ghost"
                                        className="relative flex h-auto w-full cursor-pointer items-center justify-start rounded-lg p-2 text-left"
                                        onClick={handleClick}
                                        href={item.href}
                                    >
                                        {item.icon && (
                                            <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-hover-2 text-xl dark:bg-dark-hover-1">
                                                {item.icon()}
                                            </span>
                                        )}
                                        <span className="text-sm font-medium">
                                            {item.title}
                                        </span>
                                        {item.children && (
                                            <Icons.ArrowRight className="absolute right-2 text-xl text-gray-500" />
                                        )}
                                    </Button>
                                </li>
                            );
                        })}

                        {isRootMenu && (
                            <li className="mt-2 border-t pt-2 dark:border-t-dark-secondary-2">
                                <Button
                                    variant="ghost"
                                    className="h-auto w-full justify-start p-2"
                                    onClick={handleLogout}
                                    disabled={logoutMutation.isPending}
                                >
                                    <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-hover-2 text-xl dark:bg-dark-hover-1">
                                        {logoutMutation.isPending ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                                        ) : (
                                            <Icons.LogOut />
                                        )}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {logoutMutation.isPending
                                            ? 'Đang đăng xuất...'
                                            : 'Đăng xuất'}
                                    </span>
                                </Button>
                            </li>
                        )}
                    </ul>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NavbarUser;
