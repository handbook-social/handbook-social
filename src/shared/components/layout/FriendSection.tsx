'use client';
import { useAuth } from '@/core/context/AuthContext';
import { useFriendsWithConversations } from '@/features/friend';
import { cn } from '@/lib/utils';
import { FixedSidebar } from '@/shared/components/layout';
import { Icons } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import ConversationItemSkeleton from '../skeleton/ConversationItemSkeleton';

interface Props {}

const FriendSection: React.FC<Props> = () => {
    const path = usePathname();
    const router = useRouter();
    const { user } = useAuth();

    const { data, isLoading } = useFriendsWithConversations(user?.id);

    if (!user) {
        return null;
    }

    const friends = data?.friends || [];
    const friendConversations = data?.friendConversations || [];
    const groupConversations = data?.groupConversations || [];

    return (
        <FixedSidebar className="xl:hidden" direction={'right'} hideOnMobile>
            <div className="relative h-full w-full">
                <div
                    className={cn(
                        'flex h-full w-full flex-col pl-2 pt-2 dark:border-none md:pl-0',
                        path !== '/' && 'bg-white dark:bg-dark-secondary-1'
                    )}
                >
                    <div className="flex items-center justify-between px-2">
                        <h1 className="text-md font-bold lg:hidden">
                            Bạn bè <span className="ml-2 text-sm text-secondary-1">{friends && friends.length}</span>
                        </h1>

                        <div className="hidden w-full items-center justify-center p-1 lg:flex">
                            <Icons.Users />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        {isLoading && (
                            <div className="flex flex-col gap-1">
                                <ConversationItemSkeleton />
                                <ConversationItemSkeleton />
                                <ConversationItemSkeleton />
                            </div>
                        )}

                        {friendConversations.map((conversation) => (
                            <TooltipProvider key={conversation._id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild={true}>
                                                <Button
                                                    variant={'custom'}
                                                    className="flex h-12 w-full cursor-pointer items-center justify-between p-2 text-sm shadow-sm hover:bg-hover-1 dark:hover:bg-dark-hover-1 lg:justify-center"
                                                >
                                                    <div className="flex items-center lg:h-8 lg:w-8">
                                                        <Image
                                                            className="rounded-full"
                                                            src={conversation.friend.avatar || ''}
                                                            alt={conversation.friend.name || ''}
                                                            width={32}
                                                            height={32}
                                                        />

                                                        <span className="ml-2 text-xs lg:hidden">
                                                            {conversation.friend.name}
                                                        </span>
                                                    </div>

                                                    <span className="lg:hidden">
                                                        {conversation.friend.isOnline && (
                                                            <Icons.Circle className="text-sm text-primary-2" />
                                                        )}
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align={'start'}>
                                                <DropdownMenuItem className={'p-0'}>
                                                    <Button
                                                        className={'w-full min-w-[250px] justify-start'}
                                                        variant={'ghost'}
                                                        size={'md'}
                                                        href={`/profile/${conversation.friend._id}`}
                                                    >
                                                        <Icons.Users />
                                                        Trang cá nhân
                                                    </Button>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className={'p-0'}>
                                                    <Button
                                                        className={'w-full justify-start'}
                                                        variant={'ghost'}
                                                        size={'md'}
                                                        onClick={() => router.push(`/messages/${conversation._id}`)}
                                                    >
                                                        <Icons.Message />
                                                        Nhắn tin
                                                    </Button>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <span>{conversation.friend.name}</span>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>

                    <div className="mt-2 flex items-center justify-between px-2">
                        <h1 className="text-md font-bold lg:hidden">
                            Hội thoại nhóm
                            <span className="ml-2 text-sm text-secondary-1">{groupConversations.length}</span>
                        </h1>

                        <div className="hidden w-full items-center justify-center p-1 lg:flex">
                            <Icons.Users />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        {isLoading && (
                            <div className="flex flex-col gap-1">
                                <ConversationItemSkeleton />
                                <ConversationItemSkeleton />
                                <ConversationItemSkeleton />
                            </div>
                        )}

                        {groupConversations.map((conversation) => {
                            return (
                                <TooltipProvider key={conversation._id}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                className="flex h-12 w-full cursor-pointer items-center justify-between px-2 py-1 text-sm shadow-sm hover:bg-hover-1 dark:hover:bg-dark-hover-1 lg:justify-center"
                                                href={`/messages/${conversation._id}`}
                                            >
                                                <div className="flex items-center lg:h-8 lg:w-8">
                                                    <Image
                                                        className="rounded-full"
                                                        src={
                                                            conversation?.avatar?.url ||
                                                            conversation?.group?.avatar.url ||
                                                            ''
                                                        }
                                                        alt={conversation.title || ''}
                                                        width={32}
                                                        height={32}
                                                    />

                                                    <span className="ml-2 text-xs lg:hidden">{conversation.title}</span>
                                                </div>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <span>{conversation?.title}</span>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </div>
                </div>
            </div>
        </FixedSidebar>
    );
};
export default FriendSection;
