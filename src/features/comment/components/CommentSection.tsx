'use client';

import { useAuth } from '@/core/context';
import CommentService from '@/features/comment/services/comment.service';
import queryKey from '@/lib/react-query/query-key';
import { Avatar, Icons } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { Form, FormControl } from '@/shared/components/ui/Form';
import { Textarea } from '@/shared/components/ui/textarea';
import { IComment, IPost } from '@/types/entites';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useRef } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import CommentItem from './CommentItem';
import SkeletonComment from './SkeletonComment';

interface Props {
    post: IPost;
    setCommentCount: React.Dispatch<React.SetStateAction<number>>;
}

type FormData = {
    text: string;
};

const PAGE_SIZE = 3;

const CommentSection: React.FC<Props> = ({ post, setCommentCount }) => {
    const { user, openLoginModal } = useAuth();
    const queryClient = useQueryClient();

    const {
        data: comments,
        isLoading: isLoadingComments,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: queryKey.posts.comments(post._id),
        queryFn: async ({ pageParam = 1 }) => {
            if (!post._id) return [];

            return CommentService.getByPost(post._id, {
                page: pageParam,
                page_size: PAGE_SIZE,
            });
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined;
        },
        getPreviousPageParam: (firstPage, allPages) => {
            return firstPage.length === PAGE_SIZE ? 1 : undefined;
        },
        select: (data) => data.pages.flatMap((page) => page),
        enabled: !!post._id,
        refetchOnWindowFocus: false,
        refetchInterval: false,
    });

    const form = useForm<FormData>({
        defaultValues: {
            text: '',
        },
    });
    const { handleSubmit, reset, setFocus, setValue } = form;
    const { mutate, isPending } = useMutation({
        mutationFn: async (data: FormData) => {
            await onSubmitComment(data);
        },
    });
    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Gửi bình luận
    const onSubmitComment: SubmitHandler<FormData> = useCallback(
        async (data) => {
            const { text } = data;
            if (!text || text.trim().length === 0) return;

            // Optimistic update - tăng comment count
            setCommentCount((prev) => prev + 1);

            // Reset form
            reset();
            setFocus('text');
            setValue('text', '');

            try {
                const newComment = await CommentService.create({
                    post: post._id,
                    text,
                });

                // Update post cache - tăng commentsCount
                await queryClient.setQueryData(queryKey.posts.id(post._id), (oldData: IPost | undefined) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        commentsCount: (oldData.commentsCount || 0) + 1,
                    };
                });

                // Update comments cache - thêm comment mới vào đầu
                await queryClient.setQueryData(
                    queryKey.posts.comments(post._id),
                    (
                        oldData:
                            | {
                                  pages: IComment[][];
                                  pageParams: number[];
                              }
                            | undefined
                    ) => {
                        if (!oldData) {
                            return {
                                pages: [[newComment]],
                                pageParams: [1],
                            };
                        }
                        return {
                            pages: [[newComment], ...oldData.pages],
                            pageParams: [1, ...oldData.pageParams],
                        };
                    }
                );
            } catch (error: any) {
                console.error('Error creating comment:', error);
                // Rollback optimistic update
                setCommentCount((prev) => Math.max(0, prev - 1));
                toast.error('Không thể gửi bình luận!', {
                    position: 'bottom-left',
                });
            }
        },
        [post._id, queryClient, reset, setFocus, setValue, setCommentCount]
    );

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Nếu Shift + Enter thì xuống dòng
        if (e.key === 'Enter' && e.shiftKey) return;

        if (e.key === 'Enter') {
            e.preventDefault();

            formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    }, []);

    // Memoize loading state check
    const isLoading = useMemo(() => isLoadingComments || !comments, [isLoadingComments, comments]);

    // Early return cho loading state
    if (isLoading) {
        return (
            <div className={'mt-2 flex flex-col gap-4'}>
                <SkeletonComment />
                <SkeletonComment />
                <SkeletonComment />
            </div>
        );
    }

    return (
        <>
            <div className="mb-2 mt-2 flex items-center">
                {user ? (
                    <>
                        <Avatar user={user} />

                        <div className="ml-2 flex-1">
                            <Form {...form}>
                                <form
                                    className="flex h-fit w-full overflow-hidden rounded-xl border bg-primary-1 dark:border-none dark:bg-dark-secondary-2"
                                    onSubmit={handleSubmit((data) => {
                                        mutate(data);
                                    })}
                                    ref={formRef}
                                >
                                    <Controller
                                        control={form.control}
                                        name="text"
                                        render={({ field }) => (
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    ref={inputRef}
                                                    className="cursor-text rounded-l-xl rounded-r-none bg-transparent outline-none dark:border-none"
                                                    placeholder="Viết bình luận..."
                                                    spellCheck={false}
                                                    autoComplete="off"
                                                    onKeyDown={handleKeyDown}
                                                />
                                            </FormControl>
                                        )}
                                    />

                                    <Button
                                        className="right-0 w-10 rounded-l-none rounded-r-xl px-3 hover:cursor-pointer hover:bg-hover-1 dark:border-none dark:hover:bg-dark-hover-2"
                                        variant={'custom'}
                                        type="submit"
                                        disabled={isPending}
                                    >
                                        {isPending ? <Icons.Loading className="animate-spin" /> : <Icons.Send />}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1">
                        <div 
                            className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border bg-primary-1 px-4 py-2 text-sm text-secondary-1 hover:bg-hover-1 dark:border-none dark:bg-dark-secondary-2 dark:hover:bg-dark-hover-2"
                            onClick={() => openLoginModal()}
                        >
                            <span>Đăng nhập để viết bình luận...</span>
                        </div>
                    </div>
                )}
            </div>

            {isPending && <SkeletonComment />}

            {!isPending && comments && comments.length === 0 && (
                <div className="text-center text-xs text-secondary-1">Không có bình luận</div>
            )}

            {comments &&
                comments.map((cmt) => <CommentItem data={cmt} key={cmt._id} setCommentCount={setCommentCount} />)}

            {hasNextPage && (
                <Button className="text-secondary-1" variant={'text'} size={'xs'} onClick={() => fetchNextPage()}>
                    Xem thêm bình luận
                </Button>
            )}
        </>
    );
};

export default CommentSection;
