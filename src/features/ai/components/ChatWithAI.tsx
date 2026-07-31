'use client';
import { cn } from '@/lib/utils';
import MessageSkeleton from '@/shared/components/skeleton/MessageSkeleton';
import { Avatar, Icons } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import DOMPurify from 'isomorphic-dompurify';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/core/context/AuthContext';
import { useAIChatStream } from '@/features/ai/hooks/useAIChatStream';
import { aiApi } from '@/features/ai/apis/ai.api';
import { AIChatSession } from '@/features/ai/types/ai.types';
import { parseMarkdownToHtml } from '@/features/ai/utils/markdown';

const getFriendlyErrorMessage = (errorMsg: string): string => {
    return 'Không thể kết nối với Trợ lý AI. Vui lòng kiểm tra đường truyền hoặc thử lại sau.';
};

interface IFormData {
    text: string;
}

interface IMessage {
    text: string;
    isAI: boolean;
    createAt: Date;
    isError?: boolean;
}

const ChatWithAI = () => {
    const { user, openLoginModal } = useAuth();
    const [openChat, setOpenChat] = useState<boolean>(false);
    const [messages, setMessages] = useState<IMessage[]>([]);
    
    // Sessions persistent states
    const [sessions, setSessions] = useState<AIChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [showSessionsList, setShowSessionsList] = useState<boolean>(false);
    const [sessionsPage, setSessionsPage] = useState(1);
    const [hasMoreSessions, setHasMoreSessions] = useState(false);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const form = useForm<IFormData>();
    const {
        handleSubmit,
        register,
        reset,
        resetField,
        formState: { isLoading },
    } = form;

    const path = usePathname();
    const IS_MESSAGE_PAGE = path.includes('/messages');

    // Fetch sessions list
    const fetchSessions = async (pageNum = 1, append = false, autoSelect = false) => {
        if (!user) return;
        setIsLoadingSessions(true);
        try {
            const res = await aiApi.getSessions(pageNum, 10);
            if (res.success) {
                setSessions(prev => append ? [...prev, ...res.data] : res.data);
                setHasMoreSessions(res.meta.hasNext);
                setSessionsPage(pageNum);

                // Auto-load latest session on open if requested
                if (autoSelect && res.data.length > 0 && pageNum === 1 && !append) {
                    handleSelectSession(res.data[0]._id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch AI chat sessions:', err);
        } finally {
            setIsLoadingSessions(false);
        }
    };

    // Fetch messages for a specific session
    const handleSelectSession = async (sessionId: string) => {
        try {
            setCurrentSessionId(sessionId);
            setShowSessionsList(false);
            setMessages([]); // Clear current UI messages
            
            const res = await aiApi.getSessionMessages(sessionId);
            if (res.success) {
                const mapped: IMessage[] = res.data.map(m => ({
                    text: m.parts[0]?.text || '',
                    isAI: m.role === 'model',
                    createAt: new Date(m.createdAt)
                })).reverse(); // Reverse for flex-col-reverse rendering
                setMessages(mapped);
            }
        } catch (err) {
            toast.error('Không thể tải lịch sử tin nhắn');
        }
    };

    // Start a new chat session
    const handleStartNewChat = () => {
        setCurrentSessionId(null);
        setMessages([]);
        setShowSessionsList(false);
    };

    // Delete a single chat session
    const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await aiApi.deleteSession(sessionId);
            if (res.success) {
                setSessions(prev => prev.filter(s => s._id !== sessionId));
                if (currentSessionId === sessionId) {
                    handleStartNewChat();
                }
                toast.success('Đã xóa phiên trò chuyện');
            }
        } catch (err) {
            toast.error('Không thể xóa phiên trò chuyện');
        }
    };

    // Delete all chat history
    const handleClearAllHistory = async () => {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện AI không?')) {
            try {
                const res = await aiApi.clearAllSessions();
                if (res.success) {
                    setSessions([]);
                    handleStartNewChat();
                    toast.success('Đã xóa toàn bộ lịch sử trò chuyện');
                }
            } catch (err) {
                toast.error('Không thể xóa lịch sử trò chuyện');
            }
        }
    };

    // Use custom SSE streaming hook
    const { sendMessage: sendStreamMessage, isStreaming, abortStream } = useAIChatStream({
        onChunk: (chunk, activeSessionId) => {
            setMessages(prev => {
                // If last message is AI response, append to it
                if (prev.length > 0 && prev[0].isAI) {
                    const updated = [...prev];
                    updated[0] = {
                        ...updated[0],
                        text: updated[0].text + chunk
                    };
                    return updated;
                } else {
                    // Create new AI message
                    return [
                        {
                            text: chunk,
                            isAI: true,
                            createAt: new Date()
                        },
                        ...prev
                    ];
                }
            });

            // Set session ID if server created a new session
            if (!currentSessionId && activeSessionId) {
                setCurrentSessionId(activeSessionId);
                fetchSessions(1, false);
            }
        },
        onComplete: (fullText, activeSessionId) => {
            // Refresh sessions list to update titles/timestamps
            fetchSessions(1, false);
        },
        onError: (err) => {
            const friendlyMsg = getFriendlyErrorMessage(err);
            toast.error(friendlyMsg);
            setMessages(prev => [
                {
                    text: friendlyMsg,
                    isAI: true,
                    createAt: new Date(),
                    isError: true
                },
                ...prev
            ]);
        }
    });

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

            // Send via stream
            await sendStreamMessage(text, currentSessionId || undefined);
            reset();
        } catch (error: any) {
            setMessages((prev) => [
                {
                    text: error?.message || 'Có lỗi khi gửi tin nhắn, vui lòng thử lại sau',
                    isAI: true,
                    createAt: new Date(),
                },
                ...prev,
            ]);
        }
    }

    const handleRetry = async () => {
        // Find the last user message to retry sending
        const lastUserMsg = messages.find(m => !m.isAI);
        if (lastUserMsg) {
            // Remove previous error message if it's the latest
            if (messages[0]?.isError) {
                setMessages(prev => prev.slice(1));
            }
            await sendStreamMessage(lastUserMsg.text, currentSessionId || undefined);
        }
    };

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
        const nextState = !openChat;
        setOpenChat(nextState);
        if (nextState) {
            fetchSessions(1, false, true);
        }
    };

    // Close streaming connection on unmount
    useEffect(() => {
        return () => {
            abortStream();
        };
    }, [abortStream]);

    return (
        <div className="fixed bottom-3 right-3 z-20 w-fit md:bottom-20">
            {!IS_MESSAGE_PAGE && !openChat && (
                <Button onClick={handleToggleChat} className="h-10 w-10 relative overflow-hidden rounded-full border border-gray-200 shadow-md">
                    <Image src={'/assets/img/logo.png'} alt="Handbook AI" fill className="object-contain" />
                </Button>
            )}

            {openChat && (
                <div
                    className={cn(
                        'relative flex h-[500px] w-[320px] md:w-[350px] flex-col rounded-2xl border bg-white p-2 shadow-2xl transition-all duration-200 dark:bg-dark-secondary-1 dark:border-dark-secondary-2',
                        {
                            'h-0 w-0 p-0 overflow-hidden border-none opacity-0 pointer-events-none': !openChat,
                        }
                    )}
                >
                    {openChat && (
                        <>
                            {/* Sessions sidebar overlay panel */}
                            {showSessionsList && (
                                <div className="absolute inset-0 z-30 flex flex-col bg-white p-3 dark:bg-dark-secondary-1 rounded-2xl">
                                    <div className="flex h-10 items-center justify-between border-b pb-2 mb-2 dark:border-dark-secondary-2">
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Hội thoại đã lưu</h3>
                                        <Button variant="ghost" className="p-1 h-8 w-8" onClick={() => setShowSessionsList(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </Button>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto pr-1">
                                        <Button variant="primary" className="w-full mb-3 text-xs h-9 font-semibold rounded-lg" onClick={handleStartNewChat}>
                                            + Bắt đầu phiên chat mới
                                        </Button>
                                        {isLoadingSessions && sessions.length === 0 ? (
                                            <div className="flex justify-center items-center py-10">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-2 border-t-transparent" />
                                            </div>
                                        ) : sessions.length === 0 ? (
                                            <p className="text-center text-xs text-gray-400 mt-10">Chưa có lịch sử trò chuyện</p>
                                        ) : (
                                            <div className="space-y-1">
                                                {sessions.map(session => (
                                                    <div
                                                        key={session._id}
                                                        onClick={() => handleSelectSession(session._id)}
                                                        className={cn(
                                                            "flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-hover-1 text-xs text-gray-700 dark:text-gray-300 transition-all duration-150",
                                                            {
                                                                "bg-blue-50 dark:bg-blue-950/20 text-primary-2 dark:text-blue-400 font-semibold": currentSessionId === session._id
                                                            }
                                                        )}
                                                    >
                                                        <div className="truncate mr-2 flex-1">
                                                            {session.title || 'Không có tiêu đề'}
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleDeleteSession(session._id, e)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            title="Xóa phiên"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                                {hasMoreSessions && (
                                                    <Button variant="outline" className="w-full text-xs h-8 mt-2" onClick={() => fetchSessions(sessionsPage + 1, true)}>
                                                        Tải thêm phiên cũ...
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {sessions.length > 0 && (
                                        <div className="border-t pt-2 mt-2 dark:border-dark-secondary-2">
                                            <Button variant="outline" className="w-full text-xs text-red-500 border-red-100 hover:bg-red-50 dark:hover:bg-red-950/10 h-9 font-medium" onClick={handleClearAllHistory}>
                                                Xóa tất cả lịch sử chat
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex h-14 items-center justify-between border-b p-2 dark:border-dark-secondary-2">
                                <div className="flex items-center">
                                    <Avatar
                                        imgSrc={'/assets/img/logo.png'}
                                        alt="Handbook AI"
                                        className="h-9 w-9 object-contain"
                                    />
                                    <div className="ml-2">
                                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Handbook AI</h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button variant={'ghost'} className="p-1.5 h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-hover-1" title="Lịch sử chat" onClick={() => { fetchSessions(1, false); setShowSessionsList(true); }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </Button>
                                    <Button variant={'ghost'} className="p-1.5 h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-hover-1" title="Thu nhỏ" onClick={() => setOpenChat(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </Button>
                                </div>
                            </div>

                            {/* Chat messages stream view */}
                            <div className="relative flex-1 overflow-y-auto overflow-x-hidden p-2 flex flex-col-reverse">
                                <div ref={bottomRef} />
                                {isStreaming && messages.length > 0 && messages[0].isAI && messages[0].text === '' && (
                                    <div className="w-[70%] mb-2">
                                        <MessageSkeleton />
                                    </div>
                                )}
                                {isLoading && messages.length === 0 && (
                                    <div className="w-[70%]">
                                        <MessageSkeleton />
                                    </div>
                                )}

                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={cn('mb-3 flex flex-col', {
                                            'items-start': msg.isAI,
                                            'items-end': !msg.isAI,
                                        })}
                                    >
                                        <div
                                            className={cn(
                                                'flex flex-col max-w-[80%] whitespace-pre-wrap px-3.5 py-2 text-sm leading-relaxed shadow-sm',
                                                {
                                                    'rounded-2xl rounded-tl-sm bg-gray-100 text-gray-800 dark:bg-dark-secondary-2 dark:text-gray-200': msg.isAI && !msg.isError,
                                                    'rounded-2xl rounded-tr-sm bg-primary-2 text-white': !msg.isAI && !msg.isError,
                                                    'rounded-2xl bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400': msg.isError,
                                                }
                                            )}
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: DOMPurify.sanitize(parseMarkdownToHtml(msg.text)),
                                                }}
                                            />
                                            {msg.isError && (
                                                <button
                                                    onClick={handleRetry}
                                                    className="mt-2 text-xs font-semibold flex items-center justify-center gap-1.5 h-7 px-3 rounded-full border border-red-200 bg-white text-red-500 hover:bg-red-50 dark:bg-red-950/40 dark:border-red-900 dark:hover:bg-red-950/60 transition-colors focus:outline-none"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 3v5m-.21-5h-5" />
                                                    </svg>
                                                    Thử lại
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {messages.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                        <Image src="/assets/img/logo.png" alt="Handbook AI" width={48} height={48} className="object-contain mb-3" />
                                        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">Tôi có thể giúp gì cho bạn?</h4>
                                    </div>
                                )}
                            </div>

                            {/* Form Input */}
                            <form
                                className="relative overflow-hidden rounded-xl border bg-transparent mt-1 dark:border-dark-secondary-2"
                                onSubmit={handleSubmit(onSubmit)}
                                autoComplete="off"
                            >
                                <div className="flex w-full items-center bg-gray-50 dark:bg-dark-secondary-2">
                                    <input
                                        {...register('text', {
                                            required: {
                                                message: 'Vui lòng nhập câu hỏi',
                                                value: true,
                                            },
                                        })}
                                        className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none dark:text-gray-200"
                                        type="text"
                                        placeholder={isStreaming ? "AI đang trả lời..." : "Nhập câu hỏi..."}
                                        disabled={isStreaming}
                                        spellCheck={false}
                                        autoComplete="off"
                                    />

                                    {isStreaming ? (
                                        <button
                                            type="button"
                                            onClick={abortStream}
                                            className="h-7 w-7 mr-1.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white flex items-center justify-center p-0 transition-all duration-150 focus:outline-none"
                                            title="Dừng sinh"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="h-7 w-7 mr-1.5 rounded-full text-primary-2 hover:bg-primary-2 hover:text-white dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white flex items-center justify-center p-0 transition-all duration-150 focus:outline-none"
                                            disabled={isLoading}
                                        >
                                            <Icons.Send className="h-3.5 w-3.5" />
                                        </button>
                                    )}
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
