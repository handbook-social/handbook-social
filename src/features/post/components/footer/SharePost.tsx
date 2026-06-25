'use client';
import { env } from '@/core/config/env.config';
import { useAuth } from '@/core/context/AuthContext';
import { useFriends } from '@/core/context/SocialContext';
import { ConversationService } from '@/features/conversation';
import MessageService from '@/features/message/services/message.service';
import { PostService } from '@/features/post';
import { Avatar, Icons } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { IPost } from '@/types/entites';
import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../../shared/components/ui/dialog';

interface Props {
    post: IPost;
}

const BASE_URL = env.NODE_ENV === 'production' ? 'https://handbook-social.me' : 'http://localhost:3000';

const SharePost: React.FC<Props> = ({ post }) => {
    const { user, openLoginModal } = useAuth();
    const { data: friends } = useFriends(user?.id);
    const [sended, setSended] = useState<string[]>([]);
    const [sharingFriendId, setSharingFriendId] = useState<string | null>(null);

    const handleShare = async (friendId: string) => {
        if (!user) {
            toast.error('Bạn cần đăng nhập để chia sẻ bài viết!', {
                position: 'bottom-left',
            });
            return;
        }

        setSharingFriendId(friendId);

        try {
            // Get or create conversation
            const { conversation } = await ConversationService.getPrivateConversation({
                userId: user.id,
                friendId,
            });

            if (!conversation) {
                toast.error('Không tìm thấy cuộc trò chuyện!', {
                    position: 'bottom-left',
                });
                setSharingFriendId(null);
                return;
            }

            // Share post
            await PostService.share(post._id);

            // Send message with post link
            const newMsg = await MessageService.send({
                roomId: conversation._id,
                text: `${BASE_URL}/posts/${post._id}`,
            });

            if (!newMsg) {
                toast.error('Không thể gửi tin nhắn!', {
                    position: 'bottom-left',
                });
                setSharingFriendId(null);
                return;
            }

            // Update state
            setSended([...sended, friendId]);

            toast.success('Đã chia sẻ bài viết!', { position: 'bottom-left' });
        } catch (error) {
            console.error('Error sharing post:', error);
            toast.error('Không thể chia sẻ bài viết. Vui lòng thử lại!', {
                position: 'bottom-left',
            });
        } finally {
            setSharingFriendId(null);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    className="flex-1 md:p-1" 
                    variant={'ghost'}
                    onClick={(e) => {
                        if (!user) {
                            e.preventDefault();
                            e.stopPropagation();
                            openLoginModal();
                        }
                    }}
                >
                    <Icons.Share className="text-xl" />
                    <span className="ml-1 mr-2 min-w-[10px] text-sm sm:hidden">Chia sẻ</span>
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle asChild>
                        <span>Chia sẻ bài của {post.author.name}</span>
                    </DialogTitle>

                    <DialogClose />
                </DialogHeader>

                <div className="flex max-h-[400px] flex-col gap-2 overflow-y-scroll">
                    {friends && friends.length === 0 && (
                        <div className="flex items-center justify-center text-sm text-secondary-1">
                            <span>Chưa có bạn bè để chia sẻ</span>
                        </div>
                    )}

                    {friends &&
                        friends.map((friend) => {
                            const isSend = sended.includes(friend._id);

                            return (
                                <div className="flex items-center justify-between" key={friend._id}>
                                    <div className="flex items-center gap-2">
                                        <Avatar
                                            alt={friend.name}
                                            userUrl={friend._id}
                                            imgSrc={friend.avatar}
                                            className="h-8 w-8"
                                        />
                                        <span>{friend.name}</span>
                                    </div>

                                    {isSend ? (
                                        <Button disabled variant={'secondary'}>
                                            <Icons.Send className="text-green-500" />
                                            <span>Đã gửi</span>
                                        </Button>
                                    ) : (
                                        <Button
                                            disabled={sharingFriendId === friend._id}
                                            onClick={() => handleShare(friend._id)}
                                            variant={'secondary'}
                                        >
                                            {sharingFriendId === friend._id ? (
                                                <>
                                                    <Icons.Loading className="h-4 w-4" />
                                                    <span>Đang gửi...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Icons.Send />
                                                    <span>Gửi</span>
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SharePost;
