'use client';
import { useAuth } from '@/core/context/AuthContext';
import { Icons } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/components/ui/Popover';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import SavePost from '../footer/SavePost';

import { IPost } from '@/types/entites';
import DeletePostModal from './DeletePostModal';
import EditPostModal from './EditPostModal';

interface Props {
    post: IPost;
}

const ActionPost: React.FC<Props> = ({ post }) => {
    const { user } = useAuth();
    const path = usePathname();
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    if (!user) return null;

    const isManageGroupPostActive =
        path === `/groups/${post.group?._id}/manage/posts`;

    const currentUserId = user?.id;
    const isAuthor = currentUserId === post.author._id;

    // Người dùng có thể chỉnh sửa nếu họ là tác giả
    const canEdit = isAuthor;

    // Người dùng có thể xóa nếu họ là tác giả HOẶC có quyền quản lý
    const canDelete = isAuthor || isManageGroupPostActive;

    // Người dùng có thể lưu bài viết nếu họ không phải là tác giả
    const canSave = currentUserId;

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        className="shadow-none"
                        variant={'ghost'}
                        size={'sm'}
                    >
                        <Icons.More className="text-3xl" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className={'w-[250px] px-2'}
                    asChild
                    align={'end'}
                >
                    <div className="relative flex flex-col overflow-hidden">
                        {canSave && <SavePost post={post} />}

                        {canEdit && (
                            <Button
                                className="w-full justify-start rounded-sm shadow-none"
                                variant={'ghost'}
                                onClick={() => setShowEditModal(true)}
                            >
                                <Icons.Edit className="mr-2" /> Chỉnh sửa bài
                                viết
                            </Button>
                        )}

                        {canDelete && (
                            <Button
                                className="w-full justify-start rounded-sm text-red-500 shadow-none hover:text-red-600"
                                variant={'ghost'}
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <Icons.Delete className="mr-2" /> Xóa bài viết
                            </Button>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {showEditModal && (
                <EditPostModal
                    post={post}
                    show={showEditModal}
                    setShow={setShowEditModal}
                    handleClose={() => setShowEditModal(false)}
                />
            )}

            {showDeleteModal && (
                <DeletePostModal
                    postId={post._id}
                    show={showDeleteModal}
                    setShow={setShowDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                />
            )}
        </>
    );
};

export default ActionPost;
