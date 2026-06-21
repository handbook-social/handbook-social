import { IConversation } from '@/types/entites';
import { conversationApi } from '../apis/conversation.api';
import { ConversationQueryParams, CreateConversationDto } from '../types/conversation.type';

class ConversationServiceClass {
    /**
     * Get all conversations by user id
     */
    public async getAll(params: ConversationQueryParams) {
        try {
            return await conversationApi.getAll(params);
        } catch (error) {
            console.error('Error getting conversations by user ID:', error);
            throw error;
        }
    }

    /**
     * Update a conversation
     */
    public async update(id: string, data: any) {
        return await conversationApi.update(id, data);
    }

    /**
     * Get conversation by ID using REST API
     */
    public async getById(conversationId: string) {
        try {
            return await conversationApi.getById(conversationId);
        } catch (error) {
            console.error('Error getting conversation by ID:', error);
            throw error;
        }
    }

    /**
     * Get conversations by group ID
     */
    public async getByGroupId(groupId: string) {
        try {
            return await conversationApi.getByGroupId(groupId);
        } catch (error) {
            console.error('Error getting conversation by group ID:', error);
            throw error;
        }
    }

    /**
     * Get private conversation between two users
     * Returns existing conversation or creates a new one
     */
    public async getPrivateConversation({
        userId,
        friendId,
    }: {
        userId: string;
        friendId: string;
    }): Promise<{ isNew: boolean; conversation: IConversation | null }> {
        try {
            const result = await conversationApi.getPrivateConversation({
                user_id: userId,
                friend_id: friendId,
            });
            return {
                isNew: result.isNew,
                conversation: result.conversation,
            };
        } catch (error) {
            console.error('Error getting private conversation:', error);
            throw error;
        }
    }

    /**
     * Create a new conversation using REST API
     */
    public async create(data: CreateConversationDto) {
        return await conversationApi.create(data);
    }

    /**
     * Create conversation after accepting friend request
     * TODO: This can use the regular create method
     */
    public async createAfterAcceptFriend({ userId, friendId }: { userId: string; friendId: string }) {
        // Use regular create method
        return await this.create({
            type: 'private',
            participants: [userId, friendId],
        });
    }

    /**
     * Join a conversation (add member) using REST API
     */
    public async join({ conversationId, userId }: { conversationId: string; userId: string }) {
        await conversationApi.addParticipant(conversationId, {
            participantId: userId,
        });
    }

    /**
     * Delete a conversation using REST API
     */
    public async delete(conversationId: string) {
        await conversationApi.delete(conversationId);
    }

    /**
     * Delete conversation by user (soft delete)
     */
    public async deleteByUser({ conversationId, userId }: { conversationId: string; userId: string }) {
        try {
            await conversationApi.removeParticipant(conversationId, userId);
        } catch (error) {
            console.error('Error deleting conversation by user:', error);
            throw error;
        }
    }

    /**
     * Pin a message in conversation using REST API
     */
    /**
     * Add participant to conversation using REST API
     */
    public async addParticipant(id: string, data: { participantId: string }) {
        return await conversationApi.addParticipant(id, data);
    }

    /**
     * Remove participant from conversation - Wrapper
     */
    public async removeParticipant(conversationId: string, participantId: string) {
        await conversationApi.removeParticipant(conversationId, participantId);
    }

    /**
     * Pin a message in conversation using REST API
     */
    public async pinMessage(conversationId: string, data: { messageId: string }) {
        return await conversationApi.pinMessage(conversationId, data);
    }

    /**
     * Unpin a message in conversation using REST API
     */
    public async unpinMessage(conversationId: string, messageId: string) {
        return await conversationApi.unpinMessage(conversationId, messageId);
    }

    /**
     * Leave a conversation (remove participant) using REST API
     */
    public async leaveConversation({ conversationId, userId }: { conversationId: string; userId: string }) {
        await this.removeParticipant(conversationId, userId);
    }

    /**
     * Undelete conversation by user
     * TODO: Server API needs POST /conversations/:id/restore endpoint
     */
    public async undeleteConversationByUserId({ conversationId, userId }: { conversationId: string; userId: string }) {
        // TODO: Implement undeleteConversationByUserId endpoint in server-api
        // POST /conversations/:id/restore or re-add participant
        // For now, re-add the user as participant
        try {
            await this.addParticipant(conversationId, {
                participantId: userId,
            });
        } catch (error) {
            console.error('Error undeleting conversation:', error);
            throw error;
        }
    }

    /**
     * Check if user has access to conversation
     */
    public async checkAccess(id: string) {
        try {
            return await conversationApi.checkAccess(id);
        } catch (error) {
            console.error('Error checking conversation access:', error);
            throw error;
        }
    }
}

export const ConversationService = new ConversationServiceClass();
