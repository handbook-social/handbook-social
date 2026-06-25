'use client';
import { Icons } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { useAuth } from '@/core/context/AuthContext';
import queryKey from '@/lib/react-query/query-key';
import { PostService } from '@/features/post';
import { cn } from '@/lib/utils';
import { usePreventMultiClick } from '@/shared/hooks';
import { IPost } from '@/types/entites';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';
import { InfinityPostData } from '../InfinityPostComponent';
import { usePostContext } from '../Post';

interface Props {
    post: IPost;
}

const SavePost: React.FC<Props> = ({ post }) => {
    const { handleClick, canClick } = usePreventMultiClick({
        message: 'Bạn thao tác quá nhanh, vui lòng thử lại sau 5s!',
        maxCount: 1,
    });
    const queryClient = useQueryClient();
    const { user, openLoginModal } = useAuth();

    const { postParams } = usePostContext();

    const isSaved = post.userHasSaved;

    const { mutate, isPending } = useMutation({
        mutationFn: handleSave,
        mutationKey: ['savePost', post._id],
    });

    async function handleSave() {
        handleClick();

        if (!canClick) return;
        if (!user) {
            openLoginModal();
            return;
        }

        try {
            if (isSaved) {
                await PostService.unsavePost(post._id);
            } else {
                await PostService.savePost(post._id);
            }

            await queryClient.setQueryData<InfinityPostData>(
                queryKey.posts.newFeed({
                    groupId: postParams.groupId,
                    type: postParams.type,
                    userId: postParams.userId,
                    username: postParams.username,
                }),
                (oldData) => {
                    if (!oldData) return;

                    const updatedPages = oldData.pages.map((page) =>
                        page.map((oldPost) => {
                            if (oldPost._id !== post._id) return oldPost;
                            return {
                                ...oldPost,
                                userHasSaved: !isSaved,
                            };
                        })
                    );
                    return {
                        ...oldData,
                        pages: updatedPages,
                    };
                }
            );
        } catch (error) {
            toast.error('Không thể lưu bài viết!', {
                position: 'bottom-left',
            });
        }
    }

    return (
        <Button
            className={cn('w-full justify-start rounded-sm shadow-none', {
                'text-yellow-300 hover:text-yellow-200': isSaved && !isPending,
            })}
            variant={'ghost'}
            onClick={() => mutate()}
        >
            <Icons.Bookmark className="mr-2" />{' '}
            {isPending && isSaved
                ? 'Đang hủy lưu...'
                : isPending && !isSaved
                  ? 'Đang lưu...'
                  : isSaved
                    ? 'Đã lưu'
                    : 'Lưu'}
        </Button>
    );
};

export default SavePost;
