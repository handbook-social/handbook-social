'use client';
import { useAuth, useSocket } from '@/core/context';
import { ConversationService, useGroupConversations } from '@/features/conversation';
import { useGroupMembers } from '@/features/group/hooks/group.hook';
import queryKey from '@/lib/react-query/query-key';
import { showErrorToast, showSuccessToast, timeConvert } from '@/shared';
import SidebarCollapse from '@/shared/components/layout/sidebar/SidebarCollapse';
import { Avatar, Icons, Modal } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { socketEvent } from '@/shared/constants';
import { useBreakpoint } from '@/shared/hooks';
import { GROUP_ROLES, IGroup, IMemberGroup } from '@/types/entites';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
    group: IGroup;
}

interface FormData {
    name: string;
}

const Sidebar: React.FC<Props> = ({ group: currentGroup }) => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const { breakpoint } = useBreakpoint();
    const isMobile = breakpoint === 'sm' || breakpoint === 'md';
    const nameInputId = useId();
    const queryClient = useQueryClient();

    const { data: conversations, isLoading: isLoadingConversations } = useGroupConversations(currentGroup._id);

    const [showModalCreateConversation, setShowModalCreateConversation] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const { data: membersResponse } = useGroupMembers(currentGroup._id, {
        page: 1,
        pageSize: 200,
    });
    const members = useMemo(() => membersResponse?.data || [], [membersResponse]);

    const canCreateConversation = useMemo(() => {
        return members.some(
            (member: IMemberGroup) => member.user._id === user?.id && member.role === GROUP_ROLES.ADMIN
        );
    }, [members, user?.id]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const { mutate: createGroupConversation, isPending } = useMutation({
        mutationFn: ConversationService.create,
        onSuccess: (newConversation) => {
            showSuccessToast('Tạo cuộc hội thoại thành công!');
            setShowModalCreateConversation(false);
            queryClient.invalidateQueries({
                queryKey: queryKey.conversations.byGroup(currentGroup._id),
            });

            for (const mem of members) {
                socket?.emit(socketEvent.JOIN_ROOM, {
                    roomId: newConversation._id,
                    userId: mem.user._id,
                });
            }
        },
        onError: () => {
            showErrorToast('Có lỗi xảy ra khi tạo hội thoại, vui lòng thử lại sau!');
        },
    });

    const mutateCreateConversation = (data: FormData) => {
        if (!user) {
            showErrorToast('Chưa đăng nhập');
            return;
        }
        createGroupConversation({
            participants: [user.id],
            type: 'group',
            group: currentGroup._id,
            title: data.name,
        });
    };

    const isCreator = currentGroup.creator._id === user?.id;

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [isMobile]);

    return (
        <>
            <SidebarCollapse>
                <div className="flex">
                    <Avatar imgSrc={currentGroup.avatar.url} rounded="sm" width={40} height={40} />

                    <div className="ml-2 flex flex-1 flex-col">
                        <p className="dark:text-dark-primary-1">{currentGroup.name}</p>

                        <p className="text-xs text-secondary-1">
                            Hoạt động gần nhất: {timeConvert(currentGroup.updatedAt.toString())}
                        </p>
                    </div>
                </div>

                {isCreator && (
                    <div className={'mt-4 flex w-full flex-col'}>
                        <h1 className="font-semibold">Quản lý nhóm</h1>

                        <Button
                            className="justify-start"
                            href={`/groups/${currentGroup._id}/manage/posts`}
                            variant={'ghost'}
                            size={'sm'}
                        >
                            <Icons.Posts className="h-6 w-6" />
                            <span>Quản lý bài viết</span>
                        </Button>

                        <Button
                            className="justify-start"
                            href={`/groups/${currentGroup._id}/manage`}
                            variant={'ghost'}
                            size={'sm'}
                        >
                            <Icons.Edit className="h-6 w-6" />
                            <span>Cài đặt nhóm</span>
                        </Button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    <div className="mt-2">
                        <h1 className="font-semibold">Đoạn chat đã tham gia</h1>

                        <div className="flex flex-col pt-1">
                            {conversations &&
                                conversations
                                    .filter((conversation) => conversation.type === 'group')
                                    .map((conversation) => (
                                        <Button
                                            href={`/messages/${conversation._id}`}
                                            key={conversation._id}
                                            variant={'ghost'}
                                            size={'sm'}
                                        >
                                            <Icons.Message className="h-6 w-6" />
                                            <div className="flex flex-1 flex-col">
                                                <p className="text-sm dark:text-dark-primary-1">{conversation.title}</p>
                                            </div>
                                        </Button>
                                    ))}
                        </div>
                    </div>

                    <div className="mt-2">
                        <h1 className="font-semibold">Các đoạn chat của nhóm</h1>

                        <div className="flex flex-col pt-1">
                            {conversations &&
                                conversations
                                    .filter((conversation) => conversation.type === 'group')
                                    .map((conversation) => (
                                        <Button
                                            href={`/messages/${conversation._id}`}
                                            key={conversation._id}
                                            variant={'ghost'}
                                            size={'sm'}
                                        >
                                            <Icons.Message className="h-6 w-6" />
                                            <div className="flex flex-1 flex-col">
                                                <p className="text-sm dark:text-dark-primary-1">{conversation.title}</p>
                                            </div>
                                        </Button>
                                    ))}
                        </div>
                    </div>
                </div>

                {canCreateConversation && (
                    <div>
                        <Button
                            variant={'primary'}
                            className="w-full"
                            onClick={() => setShowModalCreateConversation(true)}
                        >
                            <span className="text-sm">Tạo cuộc hội thoại</span>
                        </Button>
                    </div>
                )}

                <Modal
                    title="Tạo cuộc hội thoại"
                    show={showModalCreateConversation}
                    handleClose={() => setShowModalCreateConversation(false)}
                >
                    <form onSubmit={handleSubmit(mutateCreateConversation)} className="p-4">
                        <div>
                            <label htmlFor={nameInputId}>Tên cuộc hội thoại</label>
                            <input
                                id={nameInputId}
                                className="my-1 w-full rounded-md border bg-primary-1 p-2 dark:bg-dark-primary-1"
                                type="text"
                                placeholder="Tên cuộc hội thoại"
                                {...register('name', {
                                    required: true,
                                    maxLength: 50,
                                })}
                            />
                            <span className="text-red-500">
                                {errors.name && 'Tên cuộc hội thoại không trống và không được quá 50 ký tự'}
                            </span>
                        </div>

                        <div className="mt-2">
                            <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
                                Tạo
                            </Button>
                        </div>
                    </form>
                </Modal>
            </SidebarCollapse>
        </>
    );
};
export default Sidebar;
