'use client';
import { useAuth } from '@/core/context/AuthContext';
import CommentService from '@/features/comment/services/comment.service';
import queryKey from '@/lib/react-query/query-key';
import { cn } from '@/lib/utils';
import { timeConvert3 } from '@/shared';
import { Avatar, Icons } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { Form, FormControl } from '@/shared/components/ui/Form';
import { Textarea } from '@/shared/components/ui/textarea';
import { IComment, IUser } from '@/types/entites';
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ReplyComments from './ReplyComments';
import SkeletonComment from './SkeletonComment';

interface Props {
    data: IComment;
    setCommentCount: React.Dispatch<React.SetStateAction<number>>;
}

type FormData = {
    text: string;
};

const PAGE_SIZE = 5;

export const useReplyComments = ({
    commentId,
    enabled = true,
}: {
    commentId: string | undefined;
    enabled?: boolean;
}) =>
    useInfiniteQuery({
        queryKey: queryKey.posts.replyComments(commentId),
        queryFn: async ({ pageParam = 1 }) => {
            if (!commentId) return [];

            return CommentService.getReplies(commentId, {
                page: pageParam,
                page_size: PAGE_SIZE,
            });
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === PAGE_SIZE
                ? allPages.length + 1
                : undefined;
        },
        getPreviousPageParam: (firstPage, allPages) => {
            return firstPage.length === PAGE_SIZE ? 1 : undefined;
        },
        select: (data) => data.pages.flatMap((page) => page),
        enabled: !!commentId && enabled,
        refetchOnWindowFocus: false,
        refetchInterval: false,
    });

const CommentItem: React.FC<Props> = ({ data: comment, setCommentCount }) => {
    const { user, openLoginModal } = useAuth();
    const isDeleted = comment.isDeleted;

    const [showReplyComments, setShowReplyComments] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const [showReplyForm, setShowReplyForm] = useState<boolean>(false);
    const form = useForm<FormData>({
        defaultValues: {
            text: '',
        },
    });
    const { handleSubmit, formState, reset } = form;
    const formRef = useRef<HTMLFormElement>(null);
    const [isLoved, setIsLoved] = useState<boolean>(
        comment.loves.some((love) => love._id === user?.id)
    );

    const mutationSendReplyComment = useMutation({
        mutationFn: async (data: FormData) => {
            await sendReplyComment(data);
        },
    });

    const mutationLoveComment = useMutation({
        mutationFn: () => handleLoveComment(),
    });

    const mutationDeleteComment = useMutation({
        mutationFn: () => handleDeleteComment(),
    });

    const sendReplyComment: SubmitHandler<FormData> = async (data) => {
        if (formState.isSubmitting || formState.isLoading) return;

        try {
            reset();
            setCommentCount((prev) => prev + 1);

            const newComment = await CommentService.create({
                post: comment.post,
                text: data.text,
                replyComment: comment._id,
            });

            // Cập nhật hasReplies cho comment gốc
            if (!comment.hasReplies) {
                if (comment.replyComment) {
                    await queryClient.setQueryData(
                        queryKey.posts.replyComments(comment.replyComment),
                        (oldData: {
                            pages: IComment[][];
                            pageParams: number[];
                        }) => {
                            if (!oldData) return oldData;

                            return {
                                ...oldData,
                                pages: oldData.pages.map((page) => {
                                    return page.map((c: IComment) => {
                                        if (c._id === comment._id) {
                                            return {
                                                ...c,
                                                hasReplies: true,
                                            };
                                        }
                                        return c;
                                    });
                                }),
                            };
                        }
                    );
                } else {
                    await queryClient.setQueryData(
                        queryKey.posts.comments(comment.post),
                        (oldData: {
                            pages: IComment[][];
                            pageParams: number[];
                        }) => {
                            if (!oldData) return oldData;

                            return {
                                ...oldData,
                                pages: oldData.pages.map((page) => {
                                    return page.map((c: IComment) => {
                                        if (c._id === comment._id) {
                                            return {
                                                ...c,
                                                hasReplies: true,
                                            };
                                        }
                                        return c;
                                    });
                                }),
                            };
                        }
                    );
                }
            }

            // Cập nhật dữ liệu reply comments
            await queryClient.setQueryData(
                queryKey.posts.replyComments(comment._id),
                (oldData: { pages: IComment[][]; pageParams: number[] }) => {
                    if (!oldData) return oldData;

                    return {
                        pages: [[newComment], ...oldData.pages],
                        pageParams: [1, ...oldData.pageParams],
                    };
                }
            );

            setShowReplyComments(true);
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi gửi bình luận');
        }
    };

    const handleShowReplyForm = () => {
        setShowReplyForm((prev) => !prev);
    };

    const handleLoveComment = async () => {
        setIsLoved((prev) => !prev);

        await queryClient.setQueryData(
            queryKey.posts.comments(comment.post),
            (oldData: any) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => {
                        return page.map((c: IComment) => {
                            if (c._id === comment._id) {
                                return {
                                    ...c,
                                    loves: isLoved
                                        ? c.loves.filter(
                                              (love: IUser) =>
                                                  love._id !== user?.id
                                          )
                                        : [...c.loves, { _id: user?.id }],
                                };
                            }
                            return c;
                        });
                    }),
                };
            }
        );

        if (comment.replyComment) {
            await queryClient.setQueryData(
                queryKey.posts.replyComments(comment.replyComment),
                (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => {
                            return page.map((c: IComment) => {
                                if (c._id === comment._id) {
                                    return {
                                        ...c,
                                        loves: isLoved
                                            ? c.loves.filter(
                                                  (love: IUser) =>
                                                      love._id !== user?.id
                                              )
                                            : [...c.loves, { _id: user?.id }],
                                    };
                                }
                                return c;
                            });
                        }),
                    };
                }
            );
        }

        await CommentService.love(comment._id);
    };

    const handleDeleteComment = async () => {
        if (isDeleted) return;

        try {
            setCommentCount((prev) => prev - 1);

            await CommentService.delete(comment._id);

            await queryClient.setQueryData(
                comment.replyComment
                    ? queryKey.posts.replyComments(comment.replyComment)
                    : queryKey.posts.comments(comment.post),
                (oldData: { pages: IComment[][]; pageParams: number[] }) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => {
                            return page.map((c: IComment) => {
                                if (c._id === comment._id) {
                                    return {
                                        ...c,
                                        isDeleted: true,
                                    };
                                }
                                return c;
                            });
                        }),
                    };
                }
            );
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi xóa bình luận');
        }
    };

    // Handle key down submit form when Enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Nếu Shift + Enter thì xuống dòng
        if (e.key === 'Enter' && e.shiftKey) return;

        if (e.key === 'Enter') {
            e.preventDefault();

            formRef.current?.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
            );
        }
    };

    return (
        <div key={comment._id} className="mt-2">
            <div className="flex justify-between">
                {!isDeleted && (
                    <Avatar
                        imgSrc={comment.author.avatar}
                        userUrl={comment.author._id}
                        alt={comment.author.name}
                    />
                )}

                {isDeleted && <Avatar />}

                <div className=" ml-2 flex max-w-[calc(100%-32px)] flex-1 flex-col">
                    <div className="relative w-fit break-all rounded-xl bg-primary-1 px-4 py-1 text-sm dark:bg-dark-secondary-2">
                        {!isDeleted && (
                            <div className={'mb-1 flex items-center'}>
                                <Link
                                    href={`/profile/${comment.author._id}`}
                                    onClick={(e) => {
                                        if (!user) {
                                            e.preventDefault();
                                            openLoginModal();
                                        }
                                    }}
                                    className="mr-1 p-0 text-xs font-bold hover:underline dark:text-dark-primary-1"
                                >
                                    {comment.author.name}
                                </Link>

                                {comment.author.isVerified && (
                                    <Icons.Verified />
                                )}
                            </div>
                        )}

                        {!isDeleted && (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: comment.text,
                                }}
                            />
                        )}

                        {isDeleted && (
                            <i className="dark:text-dark-primary-3 text-sm italic text-gray-500">
                                Bình luận đã bị xóa
                            </i>
                        )}

                        <div className="absolute -bottom-2 -right-2 flex items-center">
                            {comment.loves.length > 0 && (
                                <div className="flex items-center">
                                    <Icons.Heart2 className={'text-red-500'} />
                                    <span className="ml-1 text-xs font-bold">
                                        {comment.loves.length}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-2 flex h-4 items-center">
                        <span className="dark:text-dark-primary-3 text-xs text-gray-500">
                            {timeConvert3(comment.createdAt.toString())}
                        </span>

                        <Button
                            className={cn('ml-1', {
                                'text-red-500': isLoved,
                            })}
                            variant={'text'}
                            size={'xs'}
                            onClick={() => {
                                if (!user) {
                                    openLoginModal();
                                    return;
                                }
                                mutationLoveComment.mutate();
                            }}
                            disabled={mutationLoveComment.isPending}
                        >
                            Yêu thích
                        </Button>

                        <Button
                            className="mr-2"
                            variant={'text'}
                            size={'xs'}
                            onClick={() => {
                                if (!user) {
                                    openLoginModal();
                                    return;
                                }
                                handleShowReplyForm();
                            }}
                        >
                            Trả lời
                        </Button>

                        {!isDeleted && user?.id === comment.author._id && (
                            <Button
                                variant={'text'}
                                size={'xs'}
                                onClick={() => mutationDeleteComment.mutate()}
                                disabled={mutationDeleteComment.isPending}
                            >
                                {mutationDeleteComment.isPending
                                    ? 'Đang xóa'
                                    : 'Xóa'}
                            </Button>
                        )}
                    </div>

                    {user && showReplyForm && (
                        <div className="relative mt-2 flex">
                            <Avatar user={user} />

                            <div className="ml-2 flex w-full flex-col">
                                <Form {...form}>
                                    <form
                                        className="flex h-fit w-full overflow-hidden rounded-xl bg-primary-1 dark:bg-dark-secondary-2"
                                        onSubmit={handleSubmit((data) =>
                                            mutationSendReplyComment.mutate(
                                                data
                                            )
                                        )}
                                        ref={formRef}
                                    >
                                        <Controller
                                            control={form.control}
                                            name="text"
                                            render={({ field }) => (
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        className="cursor-text overflow-auto rounded-l-xl rounded-r-none bg-transparent text-start text-sm outline-none"
                                                        placeholder="Viết bình luận..."
                                                        spellCheck={false}
                                                        autoComplete="off"
                                                        onKeyDown={
                                                            handleKeyDown
                                                        }
                                                    />
                                                </FormControl>
                                            )}
                                        />

                                        <Button
                                            className="right-0 w-10 rounded-l-none rounded-r-xl px-3 hover:cursor-pointer hover:bg-hover-1 dark:hover:bg-dark-hover-2"
                                            variant={'custom'}
                                            type="submit"
                                        >
                                            {formState.isLoading ? (
                                                <Icons.Loading className="animate-spin" />
                                            ) : (
                                                <Icons.Send />
                                            )}
                                        </Button>
                                    </form>
                                </Form>

                                <Button
                                    className="w-8 rounded-t-md"
                                    variant={'text'}
                                    size={'xs'}
                                    onClick={handleShowReplyForm}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    )}

                    {mutationSendReplyComment.isPending && <SkeletonComment />}

                    {/* {comment.hasReplies && ( */}
                    <ReplyComments
                        setShowReplyComments={setShowReplyComments}
                        showReplyComments={showReplyComments}
                        comment={comment}
                        setCommentCount={setCommentCount}
                    />
                </div>
            </div>
        </div>
    );
};

export default CommentItem;
