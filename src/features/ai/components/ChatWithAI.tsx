'use client';
import { useSendMessageMutation } from '@/features/ai/hooks/ai.hook';
import { cn } from '@/lib/utils';
import MessageSkeleton from '@/shared/components/skeleton/MessageSkeleton';
import { Avatar, Icons } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { AxiosError } from 'axios';
import DOMPurify from 'isomorphic-dompurify';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/core/context/AuthContext';

interface IFormData {
    text: string;
}

interface AIChatMessage {
    text: string;
    isAI: boolean;
    createAt: Date;
}

const ChatWithAI = () => {
    const { user, openLoginModal } = useAuth();
    const [openChat, setOpenChat] = useState<boolean>(false);
    const [messages, setMessages] = useState<AIChatMessage[]>([]);

    const bottomRef = useRef<HTMLDivElement>(null);
    const form = useForm<IFormData>();
    const {
        handleSubmit,
        register,
        reset,
        resetField,
        formState: { isLoading },
    } = form;
    const { mutateAsync: sendMessageMutation, isPending } = useSendMessageMutation();

    const path = usePathname();
    const IS_MESSAGE_PAGE = path.includes('/messages');

    async function onSubmit(data: IFormData) {
        if (!user) {
            openLoginModal();
            return;
        }

        try {
            const { text } = data;

            if (text.trim().length === 0) {
                toast.error('Vui lòng nhập tin nhắn', {
                    id: 'text-is-required',
                });
                return;
            }

            setMessages((prev) => [
                {
                    text,
                    isAI: false,
                    createAt: new Date(),
                },
                ...prev,
            ]);

            resetField('text');

            const response = await sendMessageMutation({ message: text });
            const textAI = response.response?.replace(/\*/g, '') || 'Không có phản hồi từ Handbook AI';

            setMessages((prev) => [
                {
                    text: textAI,
                    isAI: true,
                    createAt: new Date(),
                },
                ...prev,
            ]);

            reset();
        } catch (error: any) {
            setMessages((prev) => [
                {
                    text: error?.response?.data?.message || 'Có lỗi khi gửi tin nhắn, vui lòng thử lại sau',
                    isAI: true,
                    createAt: new Date(),
                },
                ...prev,
            ]);
        }
    }

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleToggleChat = () => {
        if (!user) {
            openLoginModal();
            return;
        }
        setOpenChat((prev) => !prev);
    };

    return (
        <div className="fixed bottom-3 right-3 z-20 w-fit md:bottom-20">
            {!IS_MESSAGE_PAGE && !openChat && (
                <Button onClick={handleToggleChat} className="h-10 w-10">
                    <Image src={'/assets/img/logo.png'} alt="Handbook AI" fill />
                </Button>
            )}

            {openChat && (
                <div
                    className={cn(
                        'relative flex h-full w-[30vw] min-w-[300px] flex-1 flex-col rounded-xl bg-white p-2 shadow-xl transition-all duration-200 dark:bg-dark-secondary-1 dark:shadow-none',
                        {
                            'h-0 w-0 p-0 transition-none': !openChat,
                        }
                    )}
                >
                    {openChat && (
                        <>
                            <div className="flex h-14 items-center justify-between border-b p-2 dark:border-dark-secondary-2">
                                <div className="flex items-center">
                                    <Avatar
                                        imgSrc={'/assets/img/logo.png'}
                                        alt="Handbook AI"
                                        className="h-10 w-10 object-contain"
                                    />

                                    <div className="flex flex-col">
                                        <h3 className="ml-2 text-sm">Trò chuyện cùng Handbook AI (Beta)</h3>
                                    </div>
                                </div>

                                <Button variant={'secondary'} onClick={() => setOpenChat(false)}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </Button>
                            </div>

                            <div className="relative flex h-[30vh] w-full flex-col-reverse overflow-y-auto overflow-x-hidden p-2">
                                <div ref={bottomRef}></div>
                                {isPending && (
                                    <div className="w-[70%]">
                                        <MessageSkeleton />
                                    </div>
                                )}

                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={cn('mb-2 flex flex-col items-start', {
                                            'items-end': !msg.isAI,
                                        })}
                                    >
                                        <div
                                            className={cn(
                                                'flex max-w-[70%] items-center whitespace-pre-wrap rounded-lg px-2 py-1 text-sm',
                                                {
                                                    'bg-primary-1 dark:bg-dark-secondary-2': msg.isAI,
                                                    'bg-primary-2 text-white': !msg.isAI,
                                                }
                                            )}
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(msg.text),
                                            }}
                                        />
                                    </div>
                                ))}

                                <p className="mx-4 text-center text-xs text-gray-500 dark:text-gray-400">
                                    Dữ liệu đoạn chat này không được lưu trữ và sẽ biến mất khi bạn rời khỏi trang.
                                </p>
                            </div>

                            <form
                                className="relative overflow-hidden rounded-xl border bg-transparent shadow-xl"
                                onSubmit={handleSubmit(onSubmit)}
                                autoComplete="off"
                            >
                                <div className="flex w-full">
                                    <input
                                        {...register('text', {
                                            required: {
                                                message: 'Vui lòng nhập bình luận',
                                                value: true,
                                            },
                                        })}
                                        className="flex-1 px-4 py-2 text-sm"
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        spellCheck={false}
                                        autoComplete="off"
                                    />

                                    <Button className="rounded-none border-l text-base" variant={'event'} type="submit">
                                        {isLoading ? <Icons.Loading className="animate-spin" /> : <Icons.Send />}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWithAI;
