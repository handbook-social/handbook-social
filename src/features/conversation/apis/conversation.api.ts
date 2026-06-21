import { API_ENDPOINTS, apiClient } from '@/core/api';
import { IConversation } from '@/types/entites';
import {
    AddParticipantDto,
    ConversationQueryParams,
    CreateConversationDto,
    PinMessageDto,
    PrivateConversationQueryParams,
    UpdateConversationDto,
} from '../types/conversation.type';

export const conversationApi = {
    /**
     * Get all conversations
     */
    getAll: (params?: ConversationQueryParams) => {
        return apiClient.get<IConversation[]>(API_ENDPOINTS.CONVERSATIONS.LIST, { params });
    },

    /**
     * Get conversation by ID
     */
    getById: (id: string) => {
        return apiClient.get<IConversation>(API_ENDPOINTS.CONVERSATIONS.BY_ID(id));
    },

    /**
     * Get conversation by group ID
     */
    getByGroupId: (groupId: string) => {
        return apiClient.get<IConversation[]>(API_ENDPOINTS.CONVERSATIONS.BY_GROUP(groupId));
    },

    /**
     * Get or create private conversation between two users
     */
    getPrivateConversation: (params: PrivateConversationQueryParams) => {
        return apiClient.get<{ isNew: boolean; conversation: IConversation }>(API_ENDPOINTS.CONVERSATIONS.PRIVATE, {
            params,
        });
    },

    /**
     * Create a new conversation
     */
    create: (data: CreateConversationDto) => {
        return apiClient.post<IConversation>(API_ENDPOINTS.CONVERSATIONS.CREATE, data);
    },

    /**
     * Update a conversation
     */
    update: (id: string, data: UpdateConversationDto) => {
        return apiClient.put<IConversation>(API_ENDPOINTS.CONVERSATIONS.BY_ID(id), data);
    },

    /**
     * Delete a conversation
     */
    delete: (id: string) => {
        return apiClient.delete<void>(API_ENDPOINTS.CONVERSATIONS.BY_ID(id));
    },

    /**
     * Add participant to conversation
     */
    addParticipant: (id: string, data: AddParticipantDto) => {
        return apiClient.post<IConversation>(API_ENDPOINTS.CONVERSATIONS.PARTICIPANTS(id), data);
    },

    /**
     * Remove participant from conversation
     */
    removeParticipant: (id: string, participantId: string) => {
        return apiClient.delete<void>(API_ENDPOINTS.CONVERSATIONS.REMOVE_PARTICIPANT(id, participantId));
    },

    /**
     * Pin a message in conversation
     */
    pinMessage: (id: string, data: PinMessageDto) => {
        return apiClient.post<IConversation>(API_ENDPOINTS.CONVERSATIONS.PIN(id), data);
    },

    /**
     * Unpin a message in conversation
     */
    unpinMessage: (id: string, messageId: string) => {
        return apiClient.delete<void>(API_ENDPOINTS.CONVERSATIONS.UNPIN(id, messageId));
    },

    checkAccess: (id: string) => {
        return apiClient.get<{ hasAccess: boolean; isMember: boolean; isGroupMember: boolean }>(
            `${API_ENDPOINTS.CONVERSATIONS.BY_ID(id)}/access`
        );
    },
};
