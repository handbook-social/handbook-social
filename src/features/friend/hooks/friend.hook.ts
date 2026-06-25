import { queryKey } from '@/lib/react-query/query-key';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FriendService } from '../services/friend.service';
import { FriendsWithConversationsResponse } from '../types/friend.types';

/**
 * Hook to get friends list
 */
export const useFriends = (userId: string, enabled?: boolean) => {
    return useQuery({
        queryKey: queryKey.friendships.list(userId),
        queryFn: () => FriendService.getFriends(userId),
        enabled: enabled !== false && !!userId,
    });
};

/**
 * Hook to get friends with conversations
 */
export const useFriendsWithConversations = (userId: string | undefined) => {
    return useQuery<FriendsWithConversationsResponse>({
        queryKey: ['friends-with-conversations', userId],
        queryFn: () => {
            if (!userId)
                return {
                    friendConversations: [],
                    friends: [],
                    groupConversations: [],
                };
            return FriendService.getFriendsWithConversations(userId);
        },
        enabled: !!userId,
    });
};

/**
 * Hook to add friend
 */
export const useAddFriend = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => FriendService.addFriend(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['friends'], // Simplistic invalidation, refine as needed
            });
            // Also invalidate specific user friendship status if possible
        },
    });
};

/**
 * Hook to remove friend
 */
export const useRemoveFriend = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => FriendService.removeFriend(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['friends'],
            });
        },
    });
};

/**
 * Hook to get friend suggestions
 */
export const useFriendSuggestions = (limit: number = 5, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['friend-suggestions', limit],
        queryFn: () => FriendService.getFriendSuggestions(limit),
        enabled,
    });
};
