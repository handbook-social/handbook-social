import { useAuth } from '@/core/context/AuthContext';
import { env } from '@/core/config/env.config';
import { useCallback, useRef, useState } from 'react';

interface UseAIChatStreamProps {
    onChunk: (chunk: string, sessionId: string) => void;
    onComplete: (fullText: string, sessionId: string) => void;
    onError: (error: string) => void;
}

export const useAIChatStream = ({ onChunk, onComplete, onError }: UseAIChatStreamProps) => {
    const { accessToken, refreshAccessToken } = useAuth();
    const [isStreaming, setIsStreaming] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const BASE_URL = env.NODE_ENV === 'development' ? 'http://localhost:8000/api/v1' : env.NEXT_PUBLIC_SERVER_API;

    const sendMessage = useCallback(async (message: string, sessionId?: string) => {
        setIsStreaming(true);

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        let token = accessToken;

        try {
            const sendRequest = async (authToken: string | null): Promise<Response> => {
                const headers: HeadersInit = {
                    'Content-Type': 'application/json',
                };
                if (authToken) {
                    headers['Authorization'] = `Bearer ${authToken}`;
                }

                return fetch(`${BASE_URL}/handbook-ai/chat`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ message, sessionId }),
                    signal: abortController.signal,
                });
            };

            let response = await sendRequest(token);

            // Handle 401 token expiry
            if (response.status === 401) {
                try {
                    await refreshAccessToken();
                    response = await sendRequest(accessToken);
                } catch (refreshErr) {
                    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                }
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData?.message || `Lỗi hệ thống: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Không thể khởi tạo luồng dữ liệu từ server.');
            }

            const decoder = new TextDecoder();
            let fullText = '';
            let activeSessionId = sessionId || '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunkStr = decoder.decode(value, { stream: true });
                const lines = chunkStr.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        if (dataStr === '[DONE]') {
                            onComplete(fullText, activeSessionId);
                            break;
                        }

                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.chunk) {
                                fullText += parsed.chunk;
                                if (parsed.sessionId) {
                                    activeSessionId = parsed.sessionId;
                                }
                                onChunk(parsed.chunk, activeSessionId);
                            }
                        } catch (e) {
                            // Suppress parsing errors for partial or empty lines
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Stream request aborted');
            } else {
                onError(error.message || 'Lỗi kết nối stream. Vui lòng thử lại.');
            }
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    }, [accessToken, refreshAccessToken, BASE_URL, onChunk, onComplete, onError]);

    const abortStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsStreaming(false);
        }
    }, []);

    return {
        sendMessage,
        isStreaming,
        abortStream,
    };
};
