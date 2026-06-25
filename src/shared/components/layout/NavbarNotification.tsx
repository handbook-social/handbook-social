'use client';
import { useAuth } from '@/core/context/AuthContext';
import { NotificationService, useNotifications } from '@/features/notification';
import { Button } from '@/shared/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/Popover';
import { Badge } from '@/shared/components/ui/badge';
import { useQueryInvalidation } from '@/shared/hooks';
import { useState } from 'react';
import { toast } from 'sonner';
import Icons from '../ui/Icons';
import NotificationItem from './NotificationItem';
import Link from 'next/link';

const NavbarNotification = () => {
    const { user, openLoginModal } = useAuth();
    const { data: notifications, isLoading } = useNotifications(user?.id);
    const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length : 0;

    const { invalidateNotifications } = useQueryInvalidation();
    const [open, setOpen] = useState(false);

    const handleMarkAllAsRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            await invalidateNotifications(user?.id as string);
        } catch (error) {
            toast.error('Đã có lỗi xảy ra. Vui lòng thử lại!');
        }
    };

    return (
        <>
            <Popover
                onOpenChange={() => {
                    if (user) {
                        setOpen(!open);
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        className={'relative'}
                        size={'sm'}
                        variant={'ghost'}
                        onClick={(e) => {
                            if (!user) {
                                e.preventDefault();
                                e.stopPropagation();
                                openLoginModal();
                            }
                        }}
                    >
                        {open ? (
                            <Icons.NotificationActive className="h-7 w-7" />
                        ) : (
                            <Icons.Notification className="h-7 w-7" />
                        )}

                        {unreadCount > 0 && (
                            <Badge
                                className="absolute bottom-0 right-0 px-1 py-0 text-xs font-light"
                                variant={'secondary'}
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent asChild>
                    <div className="max-h-[50vh] min-h-[300px] w-[300px] overflow-x-hidden overflow-y-scroll px-4 py-2">
                        <div className="flex items-center justify-between">
                            <h1 className="text font-bold dark:text-dark-primary-1">Thông báo</h1>

                            <Button className="p-0" size={'xs'} variant={'text'}>
                                <h5 onClick={handleMarkAllAsRead}>Đánh dấu đã đọc</h5>
                            </Button>
                        </div>

                        {notifications &&
                            notifications.map((notification) => {
                                return <NotificationItem key={notification._id} data={notification} />;
                            })}

                        {notifications && notifications.length == 0 && !isLoading && (
                            <div className="flex h-[200px] w-full items-center justify-center text-sm dark:text-dark-primary-1">
                                <p>Không có thông báo nào</p>
                            </div>
                        )}

                        {notifications && notifications.length > 0 && (
                            <div className="mt-4 flex justify-center border-t py-2 dark:border-dark-secondary-1">
                                <Link
                                    href="/notification"
                                    onClick={() => setOpen(false)}
                                    className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium hover:underline"
                                >
                                    Xem tất cả
                                </Link>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
};

export default NavbarNotification;
