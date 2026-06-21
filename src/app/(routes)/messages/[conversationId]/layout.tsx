'use client';
import { useConversationAccess } from '@/features/conversation';
import { Icons, Loading } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

interface Props {
    children: React.ReactNode;
}

const MessageLayout: React.FC<Props> = ({ children }) => {
    const params = useParams();
    const router = useRouter();
    const conversationId = params.conversationId as string;

    const { data, isLoading, isError, error } = useConversationAccess(conversationId);

    if (isLoading) {
        return <Loading fullScreen />;
    }

    if (isError || (data && !data.hasAccess)) {
        const isForbidden = !data?.hasAccess;
        const isNotFound = (error as any)?.response?.status === 404;

        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-secondary-1 p-4 dark:bg-dark-secondary-1">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight dark:text-dark-primary-1 sm:text-3xl">
                            {isForbidden
                                ? 'Bạn không có quyền truy cập'
                                : isNotFound
                                  ? 'Không tìm thấy cuộc hội thoại'
                                  : 'Đã có lỗi xảy ra'}
                        </h1>
                        <p className="dark:text-dark-primary-2 max-w-[400px] text-secondary-2">
                            {isForbidden
                                ? 'Xin lỗi, bạn không phải là thành viên của cuộc trò chuyện này nên không thể xem tin nhắn.'
                                : isNotFound
                                  ? 'Cuộc trò chuyện này có thể đã bị xóa hoặc đường dẫn không chính xác.'
                                  : 'Chúng tôi gặp sự cố khi tải cuộc trò chuyện này. Vui lòng thử lại sau.'}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                        <Button variant="primary" size="sm" className="px-8 shadow-md" onClick={() => router.push('/')}>
                            <Icons.Home className="mr-2 h-5 w-5" />
                            Về trang chủ
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="px-8 shadow-sm dark:bg-dark-secondary-2"
                            onClick={() => router.back()}
                        >
                            <Icons.ArrowLeft className="mr-2 h-5 w-5" />
                            Quay lại
                        </Button>
                    </div>
                </div>

                {/* Subtle background glow for premium feel */}
                <div className="fixed -z-10 h-[500px] w-[500px] rounded-full bg-red-500/5 blur-[120px] dark:bg-red-500/10" />
            </div>
        );
    }

    return <>{children}</>;
};

export default MessageLayout;
