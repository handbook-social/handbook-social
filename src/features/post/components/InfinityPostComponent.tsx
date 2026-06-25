'use client';
import { apiClient } from '@/core/api/api-client';
import { useAuth } from '@/core/context/AuthContext';
import queryKey from '@/lib/react-query/query-key';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/Button';
import { IPost } from '@/types/entites';
import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { Icons, Modal, Avatar } from '../../../shared/components/ui';
import Image from '../../../shared/components/ui/image';
import CreatePost from './CreatePost';
import Post from './Post';
import SkeletonPost from './SkeletonPost';
import { FriendSuggestionsCard } from '@/shared/components/layout';

export type PostType =
    | 'new-feed'
    | 'profile'
    | 'group'
    | 'new-feed-group'
    | 'new-feed-friend'
    | 'manage-group-posts'
    | 'manage-group-posts-pending'
    | 'post-by-member'
    | 'search-posts'
    | 'saved';

export type PostParams = {
    userId?: string;
    groupId?: string;
    username?: string;
    type?: PostType;
};

export type InfinityPostData = {
    pages: IPost[][];
    pageParams: number[];
};

export const PostTypes = {
    NEW_FEED: 'new-feed' as PostType,
    PROFILE: 'profile' as PostType,
    GROUP: 'group' as PostType,
    NEW_FEED_GROUP: 'new-feed-group' as PostType,
    NEW_FEED_FRIEND: 'new-feed-friend' as PostType,
    MANAGE_GROUP_POSTS: 'manage-group-posts' as PostType,
    MANAGE_GROUP_POSTS_PENDING: 'manage-group-posts-pending' as PostType,
    POST_BY_MEMBER: 'post-by-member' as PostType,
    SEARCH_POSTS: 'search-posts' as PostType,
};

interface Props {
    className?: string;
    userId?: string;
    username?: string;
    groupId?: string;
    type?: PostType;
    title?: string;
    showCreatePost?: boolean;
    enabled?: boolean;
    search?: string;
    showEmptyState?: boolean;
}

const PAGE_SIZE = 3;
const REFETCH_INTERVAL = 1000 * 60 * 5; // 5 minutes

const ENDPOINTS: Record<PostType, string> = {
    'new-feed': '/posts/new-feed',
    'new-feed-group': '/posts/new-feed-group',
    'new-feed-friend': '/posts/new-feed-friend',
    profile: '/posts/profile',
    group: '/posts/group',
    'manage-group-posts': '/posts/group',
    'post-by-member': '/posts/group',
    'manage-group-posts-pending': '/posts/group',
    saved: '/posts/saved',
    'search-posts': '/search/posts',
};

export const useInfiniteQueryPost = ({
    userId,
    groupId,
    username,
    type = 'new-feed',
    search = '',
    enabled = true,
}: Pick<Props, 'userId' | 'groupId' | 'username' | 'type' | 'enabled' | 'search'>) => {
    const { user } = useAuth();

    const isFeedType = useMemo(() => ['new-feed', 'new-feed-friend', 'new-feed-group'].includes(type), [type]);

    const getEndpoint = useCallback(
        (type: PostType) => {
            const baseEndpoint = ENDPOINTS[type];
            if (type === 'profile') return `${baseEndpoint}/${userId}`;
            if (type === 'group') return `${baseEndpoint}/${groupId}`;
            if (type === 'manage-group-posts') return `${baseEndpoint}/${groupId}/manage`;
            if (type === 'manage-group-posts-pending') return `${baseEndpoint}/${groupId}/manage/pending`;
            if (type === 'post-by-member') return `${baseEndpoint}/${groupId}/member/${userId}`;
            return baseEndpoint;
        },
        [userId, groupId]
    );

    const fetchPosts = useCallback(
        async (pageParam: number) => {
            if (!user?.id && type !== 'new-feed') return [];

            const endpoint = getEndpoint(type);
            const params = {
                page: pageParam,
                page_size: PAGE_SIZE,
                ...(isFeedType && user?.id && { user_id: user.id }),
                ...(type === 'post-by-member' && {
                    user_id: userId,
                    group_id: groupId,
                }),
                ...(type === 'search-posts' && { q: search }),
            };

            // apiClient.get() tự động extract response.data.data
            const data = await apiClient.get<IPost[]>(endpoint, {
                params,
            });
            return data || [];
        },
        [user?.id, getEndpoint, type, isFeedType, userId, groupId, search]
    );

    return useInfiniteQuery({
        queryKey: queryKey.posts.newFeed({
            groupId,
            type,
            userId,
            username,
        }),
        queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined;
        },
        select: (data) => data.pages.flat(),
        initialPageParam: 1,
        refetchInterval: REFETCH_INTERVAL,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: (type === 'new-feed' || (!!user && !!user.id)) && enabled,
    });
};

const InfinityPostComponent: React.FC<Props> = ({
    className,
    userId,
    groupId,
    username,
    type = 'new-feed',
    title,
    showCreatePost = true,
    showEmptyState = true,
}) => {
    const { user, openLoginModal } = useAuth();
    const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
        useInfiniteQueryPost({ userId, groupId, username, type });
    const params = {
        userId,
        groupId,
        username,
        type,
    };

    const { ref: bottomRef, inView } = useInView({ threshold: 0 });
    const currentUser = user;

    const isManage = type === 'manage-group-posts-pending';
    const isCurrentUser = useMemo(
        () => currentUser?.id === userId || currentUser?.username === username,
        [currentUser?.id, currentUser?.username, userId, username]
    );

    const [showModalCreatePost, setShowModalCreatePost] = useState(false);

    const handleClose = useCallback(() => setShowModalCreatePost(false), []);
    const handleShow = useCallback(() => {
        if (!currentUser) {
            openLoginModal();
            return;
        }
        setShowModalCreatePost(true);
    }, [currentUser, openLoginModal]);

    const shouldShowCreatePost = useMemo(
        () =>
            showCreatePost &&
            !isManage &&
            ((type === 'new-feed') ||
                (type === 'profile' && isCurrentUser) ||
                (type === 'group' && currentUser && groupId)),
        [showCreatePost, isManage, type, currentUser, isCurrentUser, groupId]
    );

    const handleFetchNextPage = useCallback(async () => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            try {
                await fetchNextPage();
            } catch (error) {
                toast.error('Có lỗi xảy ra khi tải bài viết');
            }
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        handleFetchNextPage();
    }, [handleFetchNextPage]);

    const renderLoader = useCallback(() => {
        if (isLoading || isFetchingNextPage) {
            return (
                <div>
                    <SkeletonPost />
                    <SkeletonPost />
                    <SkeletonPost />
                </div>
            );
        }

        if (isFetching) {
            return (
                <div className="flex justify-center py-10">
                    <Icons.Loading className="text-4xl" />
                </div>
            );
        }

        return null;
    }, [isLoading, isFetching, isFetchingNextPage]);

    const renderCreatePost = useCallback(() => {
        if (!shouldShowCreatePost && !showModalCreatePost) return null;

        const isGroupPost = type === 'group' && groupId;

        return (
            <>
                <div className="mb-4 rounded-xl bg-white px-4 py-2 shadow-md transition-all duration-300 ease-in-out dark:bg-dark-secondary-1">
                    <div className="flex items-center">
                        <Avatar user={user || undefined} className="h-10 w-10" width={40} height={40} />
                        <div
                            className="ml-3 flex h-10 flex-1 cursor-text items-center rounded-xl bg-primary-1 px-3 dark:bg-dark-secondary-2"
                            onClick={handleShow}
                        >
                            <h5 className="text-secondary-1">
                                {type === 'group' ? 'Đăng bài lên nhóm này...' : 'Bạn đang nghĩ gì?'}
                            </h5>
                        </div>
                    </div>
                </div>

                <Modal handleClose={handleClose} show={showModalCreatePost} title="Đăng bài viết">
                    <CreatePost
                        className="w-[700px] max-w-full"
                        onSubmitSuccess={handleClose}
                        hasMenu={false}
                        {...(isGroupPost && { groupId, type: 'group' })}
                    />
                </Modal>
            </>
        );
    }, [shouldShowCreatePost, showModalCreatePost, user, handleShow, type, groupId, handleClose]);

    return (
        <div className={cn(className, 'relative w-full')}>
            {/* Header section */}
            {title && <h5 className="mb-2 text-xl font-bold">{title}</h5>}

            {/* Refresh button for management view */}
            {isManage && (
                <div className={'flex justify-center'}>
                    <Button onClick={() => refetch()} className="mb-2" variant="secondary" size={'sm'}>
                        Tải mới
                    </Button>
                </div>
            )}

            {/* Post creation form */}
            {renderCreatePost()}

            {/* Posts list */}
            {data?.map((post, index) => {
                return (
                    <React.Fragment key={post._id}>
                        <Post data={post} isManage={isManage} params={params} />
                        {type === 'new-feed' && index === 0 && <FriendSuggestionsCard />}
                    </React.Fragment>
                );
            })}

            {/* Empty state */}
            {showEmptyState && data && data.length === 0 && (
                <div className="flex justify-center py-2">
                    <p className="dark:text-dark-primary-1">Không có bài viết nào</p>
                </div>
            )}

            {/* Infinite scroll trigger */}
            <div className={'absolute bottom-0 w-full bg-transparent p-2'} ref={bottomRef} aria-hidden="true" />

            {/* Loading states */}
            {renderLoader()}
        </div>
    );
};

export default React.memo(InfinityPostComponent);
