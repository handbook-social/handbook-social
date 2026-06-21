import { queryKey } from '@/lib/react-query/query-key';
import { createGetNextPageParam, defaultInfiniteQueryOptions, defaultQueryOptions } from '@/lib/react-query';
import { handleApiError, showSuccessToast } from '@/shared';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ConversationService } from '../services/conversation.service';
import {
    AddParticipantDto,
    ConversationQueryParams,
    CreateConversationDto,
    PinMessageDto,
    UpdateConversationDto,
} from '../types/conversation.type';
import { IConversation } from '@/types/entites';

/**
 * Hook to get all conversations (infinite query)
 */
export const useConversations = (params?: ConversationQueryParams, options?: { enabled?: boolean }) => {
    const pageSize = params?.page_size || 10;

    return useInfiniteQuery({
        queryKey: queryKey.conversations.userId(params?.user_id),
        queryFn: ({ pageParam = 1 }) =>
            ConversationService.getAll({
                ...params,
                page: pageParam,
            }),
        getNextPageParam: createGetNextPageParam(pageSize),
        enabled: options?.enabled !== false,
        initialPageParam: 1,
        ...defaultInfiniteQueryOptions,
    });
};

/**
 * Hook to get a conversation by ID
 */
export const useConversation = (conversationId: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: queryKey.conversations.id(conversationId),
        queryFn: () => ConversationService.getById(conversationId),
        enabled: options?.enabled !== false && !!conversationId,
        ...defaultQueryOptions,
    });
};

/**
 * Hook to get conversations by group ID
 */
export const useGroupConversations = (groupId: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: queryKey.conversations.byGroup(groupId),
        queryFn: async () => await ConversationService.getByGroupId(groupId),
        enabled: options?.enabled !== false && !!groupId,
        ...defaultQueryOptions,
    });
};

/**
 * Hook to check if user has access to conversation
 */
export const useConversationAccess = (conversationId: string) => {
    return useQuery({
        queryKey: queryKey.conversations.access(conversationId),
        queryFn: () => ConversationService.checkAccess(conversationId),
        enabled: !!conversationId,
        ...defaultQueryOptions,
    });
};

/**
 * Hook to create a conversation
 */
export const useCreateConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateConversationDto) => ConversationService.create(data),
        onSuccess: (data) => {
            // Invalidate conversations list
            queryClient.invalidateQueries({
                queryKey: queryKey.conversations.list(undefined),
            });
            // Update cache
            queryClient.setQueryData(queryKey.conversations.id(data._id), data);
            showSuccessToast('Tạo cuộc trò chuyện thành công');
        },
        onError: (error) => {
            handleApiError(error, 'Không thể tạo cuộc trò chuyện');
        },
    });
};

/**
 * Hook to update a conversation
 */
export const useUpdateConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateConversationDto }) => ConversationService.update(id, data),
        onSuccess: (data, variables) => {
            // Update cache
            queryClient.setQueryData(queryKey.conversations.id(variables.id), data);
            // Invalidate list
            queryClient.invalidateQueries({
                queryKey: queryKey.conversations.list(undefined),
            });
            showSuccessToast('Cập nhật cuộc trò chuyện thành công');
        },
        onError: (error) => {
            handleApiError(error, 'Không thể cập nhật cuộc trò chuyện');
        },
    });
};

/**
 * Hook to delete a conversation
 */
export const useDeleteConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId: string) => ConversationService.delete(conversationId),
        onSuccess: (_, conversationId) => {
            // Remove from cache
            queryClient.removeQueries({
                queryKey: queryKey.conversations.id(conversationId),
            });
            // Invalidate list
            queryClient.invalidateQueries({
                queryKey: queryKey.conversations.list(undefined),
            });
            showSuccessToast('Xóa cuộc trò chuyện thành công');
        },
        onError: (error) => {
            handleApiError(error, 'Không thể xóa cuộc trò chuyện');
        },
    });
};

/**
 * Hook to add participant to conversation
 */
export const useAddParticipant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: AddParticipantDto }) =>
            ConversationService.addParticipant(id, data),
        onSuccess: (data, variables) => {
            // Update cache
            queryClient.setQueryData(queryKey.conversations.id(variables.id), data);
            showSuccessToast('Đã thêm thành viên');
        },
        onError: (error) => {
            handleApiError(error, 'Không thể thêm thành viên');
        },
    });
};

/**
 * Hook to remove participant from conversation
 */
export const useRemoveParticipant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, participantId }: { id: string; participantId: string }) =>
            ConversationService.removeParticipant(id, participantId),
        onSuccess: (data, variables) => {
            // Update cache
            queryClient.setQueryData(queryKey.conversations.id(variables.id), data);
            showSuccessToast('Đã xóa thành viên');
        },
        onError: (error) => {
            handleApiError(error, 'Không thể xóa thành viên');
        },
    });
};

/**
 * Hook to pin a message in conversation
 */
export const usePinMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: PinMessageDto }) => ConversationService.pinMessage(id, data),
        onSuccess: (data, variables) => {
            // Update cache
            queryClient.setQueryData(queryKey.conversations.id(variables.id), data);
            // Invalidate pinned messages
            queryClient.invalidateQueries({
                queryKey: queryKey.messages.pinnedMessages(variables.id),
            });
            showSuccessToast('Đã ghim tin nhắn');
        },
        onError: (error) => {
            handleApiError(error, 'Không thể ghim tin nhắn');
        },
    });
};

/**
 * Hook to unpin a message in conversation
 */
export const useUnpinMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, messageId }: { id: string; messageId: string }) =>
            ConversationService.unpinMessage(id, messageId),
        onSuccess: (data, variables) => {
            // Update cache
            queryClient.setQueryData(queryKey.conversations.id(variables.id), data);
            // Invalidate pinned messages
            queryClient.invalidateQueries({
                queryKey: queryKey.messages.pinnedMessages(variables.id),
            });
            showSuccessToast('Đã bỏ ghim tin nhắn');
        },
        onError: (error) => {
            handleApiError(error, 'Không thể bỏ ghim tin nhắn');
        },
    });
};
/**
 * Hook to get or create private conversation
 */
export const usePrivateConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, friendId }: { userId: string; friendId: string }) =>
            ConversationService.getPrivateConversation({ userId, friendId }),
        onSuccess: (data) => {
            if (data.isNew) {
                // Invalidate conversations list if new conversation created
                queryClient.invalidateQueries({
                    queryKey: queryKey.conversations.list(undefined),
                });
            }
        },
        onError: (error) => {
            handleApiError(error, 'Không thể lấy cuộc trò chuyện');
        },
    });
};
