'use client';
import VerifiedUser from '@/shared/components/VerifiedUser';
import { timeConvert3 } from '@/shared';
import { postAudience } from '@/shared/constants';
import { IPost } from '@/types/entites';
import Link from 'next/link';
import { useMemo } from 'react';
import { Avatar } from '../../../shared/components/ui';
import { useAuth } from '@/core/context/AuthContext';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../../../shared/components/ui/tooltip';
import ActionPost from './action/ActionPost';

interface Props {
    post: IPost;
}

const PostHeader = ({ post }: Props) => {
    const { user, openLoginModal } = useAuth();
    const isGroupPost = useMemo(() => post?.type === 'group', [post]);

    const IconType = postAudience.find(
        (item) => item.value === post.option
    )?.icon;

    return (
        <div className="flex w-full items-start justify-between">
            {/* Left section: Avatar + Info */}
            <div className="flex items-start">
                {/* Avatar */}
                {isGroupPost && post.group ? (
                    <div className="relative">
                        <Avatar
                            className="h-10 w-10"
                            imgSrc={post.group.avatar.url}
                            href={`/groups/${post.group._id}`}
                            alt={post.group.name}
                            rounded="xl"
                        />
                        <Avatar
                            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                            imgSrc={post.author.avatar}
                            userUrl={post.author._id}
                            alt={post.author.name}
                            rounded="full"
                        />
                    </div>
                ) : (
                    <Avatar
                        className="h-10 w-10"
                        imgSrc={post.author.avatar}
                        userUrl={post.author._id}
                        alt={post.author.name}
                        rounded="full"
                    />
                )}

                {/* Info */}
                <div className="ml-3 flex flex-col">
                    {/* Name or Group Name */}
                    <div className="flex items-center gap-1">
                        <Link
                            href={
                                post.group
                                    ? `/groups/${post.group._id}`
                                    : `/profile/${post.author._id}`
                            }
                            onClick={(e) => {
                                if (!user) {
                                    e.preventDefault();
                                    openLoginModal();
                                }
                            }}
                            className="text-sm font-semibold hover:underline dark:text-dark-primary-1"
                        >
                            {post.group ? post.group.name : post.author.name}
                        </Link>

                        {!post.group && post.author.isVerified && (
                            <VerifiedUser className="text-blue-500" />
                        )}
                    </div>

                    {/* Author name (if in group) */}
                    {post.group && (
                        <div className="flex items-center gap-1">
                            <Link
                                href={`/profile/${post.author._id}`}
                                onClick={(e) => {
                                    if (!user) {
                                        e.preventDefault();
                                        openLoginModal();
                                    }
                                }}
                                className="text-xs text-secondary-1 hover:underline dark:text-dark-primary-1"
                            >
                                {post.author.name}
                            </Link>
                            {post.author.isVerified && (
                                <VerifiedUser className="text-blue-500" />
                            )}
                        </div>
                    )}

                    {/* Time + Privacy */}
                    <div className="flex items-center gap-1 text-xs text-secondary-1">
                        <span>{timeConvert3(post.createdAt.toString())}</span>

                        {IconType && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <IconType className="ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <span className="text-xs">
                                            {
                                                postAudience.find(
                                                    (item) =>
                                                        item.value ===
                                                        post.option
                                                )?.label
                                            }
                                        </span>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            </div>

            <ActionPost post={post} />
        </div>
    );
};

export default PostHeader;
