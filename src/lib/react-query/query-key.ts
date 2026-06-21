/**
 * Query Keys - Centralized query key definitions
 * Used for React Query cache management
 */

export const queryKey = {
    // Auth
    auth: {
        current: ['auth', 'current'],
    },

    // Users
    users: {
        list: (params?: { page?: number; pageSize?: number }) => ['users', 'list', params],
        byId: (id: string) => ['users', id],
    },

    user: {
        id: (userId: string | undefined) => ['user', userId],
        profile: (userId: string | undefined) => ['profile', userId],
        followers: (userId: string | undefined) => ['followers', userId],
        followings: (userId: string | undefined) => ['following', userId],
        friends: (userId: string | undefined) => ['friends', userId],
        requests: (userId: string | undefined) => ['requests', userId],
        notifications: (userId: string | undefined) => ['notifications', userId],
        groups: (userId: string | undefined) => ['groups', userId],
    },

    // Posts
    posts: {
        all: () => ['posts'],
        id: (postId: string) => ['post', postId],
        newFeed: ({
            type,
            userId,
            groupId,
            username,
        }: {
            type?: string;
            userId?: string;
            groupId?: string;
            username?: string;
        }) => ['posts', 'newFeed', { type, userId, groupId, username }],
        saved: (userId?: string) => ['posts', 'saved', userId],
        profile: (userId: string) => ['posts', 'profile', userId],
        group: (groupId: string) => ['posts', 'group', groupId],
        comments: (postId: string | undefined) => ['comments', postId],
        replyComments: (commentId: string | undefined) => ['replyComments', commentId],
    },

    // Comments
    comments: {
        byPost: (postId: string) => ['comments', 'post', postId],
        byId: (id: string) => ['comments', id],
        replies: (commentId: string) => ['comments', 'replies', commentId],
        count: (postId: string) => ['comments', 'count', postId],
        // Alias for backward compatibility
        id: (id: string) => ['comment', id],
    },
    // Friendships
    friendships: {
        list: (userId: string) => ['friendships', 'list', userId],
        count: (userId: string) => ['friendships', 'count', userId],
        check: (userId: string) => ['friendships', 'check', userId],
    },

    // Messages
    messages: {
        conversationId: (conversationId: string | undefined) => ['messages', 'conversation', conversationId],
        pinnedMessages: (conversationId: string | undefined) => ['pinnedMessages', conversationId],
        search: (conversationId: string, keyword: string) => ['messages', 'search', conversationId, keyword],
    },

    // Conversations
    conversations: {
        list: (userId?: string) => ['conversations', userId],
        id: (conversationId: string | undefined) => ['conversation', conversationId],
        userId: (userId: string | undefined) => ['conversations', userId],
        members: (conversationId: string | undefined) => ['conversation', 'members', conversationId],
        byGroup: (groupId: string | undefined) => ['conversations', 'group', groupId],
        access: (conversationId: string | undefined) => ['conversation', 'access', conversationId],
    },

    // Groups
    groups: {
        joined: (userId?: string) => ['groups', 'joined', userId],
        byId: (id: string) => ['groups', id],
        // Alias for backward compatibility
        id: (id: string) => ['group', id],
        members: (groupId: string, params?: { page?: number; pageSize?: number }) => [
            'groups',
            'members',
            groupId,
            params,
        ],
        recommended: (userId?: string) => ['groups', 'recommended', userId],
    },

    // Items
    items: {
        index: ['items'],
        list: (params?: { page?: number; pageSize?: number }) => ['items', 'list', params],
        bySeller: (sellerId: string) => ['items', 'seller', sellerId],
        search: (query: string) => ['items', 'search', query],
        byId: (id: string) => ['items', id],
    },

    // Notifications
    notifications: {
        byReceiver: (receiverId: string) => ['notifications', 'receiver', receiverId],
        bySender: (senderId: string) => ['notifications', 'sender', senderId],
    },

    // Search
    search: {
        general: (query: string, type?: string) => ['search', query, type],
        users: (query: string) => ['search', 'users', query],
        posts: (query: string) => ['search', 'posts', query],
        groups: (query: string) => ['search', 'groups', query],
    },

    // Categories
    categories: {
        list: () => ['categories'],
        all: () => ['categories', 'all'],
        byId: (id: string) => ['categories', id],
        bySlug: (slug: string) => ['categories', 'slug', slug],
        search: (q: string) => ['categories', 'search', q],
    },

    // Locations
    locations: {
        list: () => ['locations'],
    },

    // Follows
    follows: {
        followings: (userId: string) => ['follows', 'followings', userId],
    },

    // Admin
    admin: {
        users: {
            root: ['admin', 'users'],
            index: (params?: any) => ['admin', 'users', params],
            id: (userId: string | undefined) => ['admin', 'user', userId],
        },
        posts: {
            index: ['admin', 'posts'],
            id: (postId: string | undefined) => ['admin', 'post', postId],
        },
        conversations: {
            index: ['admin', 'conversations'],
            id: (conversationId: string | undefined) => ['admin', 'conversation', conversationId],
        },
        groups: {
            index: ['admin', 'groups'],
            id: (groupId: string | undefined) => ['admin', 'group', groupId],
        },
        media: {
            index: ['admin', 'media'],
            id: (mediaId: string | undefined) => ['admin', 'media', mediaId],
        },
    },
};

export default queryKey;
