import { apiClient } from '../../../core/api/api-client';
import { API_ENDPOINTS } from '../../../core/api/endpoints';
import {
    AIChatRequest,
    AIChatResponse,
    AIChatSessionsResponse,
    AIChatMessagesResponse,
} from '../types/ai.types';

export const aiApi = {
    sendMessage: (data: AIChatRequest) => {
        return apiClient.post<AIChatResponse>(
            API_ENDPOINTS.AI.HANDBOOK_AI_CHAT,
            data
        );
    },
    getSessions: (page = 1, limit = 10) => {
        return apiClient.get<AIChatSessionsResponse>(
            API_ENDPOINTS.AI.HANDBOOK_AI_SESSIONS,
            {
                params: { page, limit },
            }
        );
    },
    getSessionMessages: (sessionId: string) => {
        return apiClient.get<AIChatMessagesResponse>(
            API_ENDPOINTS.AI.HANDBOOK_AI_SESSION_MESSAGES(sessionId)
        );
    },
    deleteSession: (sessionId: string) => {
        return apiClient.delete<{ success: boolean; message: string }>(
            API_ENDPOINTS.AI.HANDBOOK_AI_DELETE_SESSION(sessionId)
        );
    },
    clearAllSessions: () => {
        return apiClient.delete<{ success: boolean; message: string }>(
            API_ENDPOINTS.AI.HANDBOOK_AI_SESSIONS
        );
    },
};
export default aiApi;
