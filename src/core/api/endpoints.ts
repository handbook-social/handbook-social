/**
 * API Endpoints Constants
 * Centralized endpoint definitions for all API routes
 */

export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        SEND_OTP: '/auth/send-otp',
        VERIFY_OTP: '/auth/verify-otp',
        RESET_PASSWORD: '/auth/reset-password',
        GOOGLE_LOGIN: '/auth/google',
        CHECK_USERNAME: '/auth/check-username',
    },

    // Users endpoints
    USERS: {
        LIST: '/users',
        PROFILE: (userId: string) => `/users/${userId}/profile`,
        BIO: (userId: string) => `/users/${userId}/bio`,
        PICTURES: (userId: string) => `/users/${userId}/pictures`,
        AVATAR: (userId: string) => `/users/${userId}/avatar`,
        COVER_PHOTO: (userId: string) => `/users/${userId}/cover-photo`,
    },

    // Friendships endpoints
    FRIENDSHIPS: {
        BY_USER: (userId: string) => `/friendships/${userId}`,
        COUNT: (userId: string) => `/friendships/${userId}/count`,
        COMMON: (userId1: string, userId2: string) => `/friendships/${userId1}/common/${userId2}`,
        CHECK: (userId: string) => `/friendships/check/${userId}`,
        CREATE: '/friendships',
        REMOVE: (userId: string) => `/friendships/${userId}`,
    },

    // Posts endpoints
    POSTS: {
        LIST: '/posts',
        CREATE: '/posts',
        BY_ID: (id: string) => `/posts/${id}`,
        NEW_FEED: '/posts/new-feed',
        NEW_FEED_GROUP: '/posts/new-feed-group',
        NEW_FEED_FRIEND: '/posts/new-feed-friend',
        SAVED: '/posts/saved',
        PROFILE: (userId: string) => `/posts/profile/${userId}`,
        GROUP: (groupId: string) => `/posts/group/${groupId}`,
        GROUP_MANAGE: (groupId: string) => `/posts/group/${groupId}/manage`,
        GROUP_MANAGE_PENDING: (groupId: string) => `/posts/group/${groupId}/manage/pending`,
        GROUP_MEMBER: (groupId: string, userId: string) => `/posts/group/${groupId}/member/${userId}`,
        LIKE: (postId: string) => `/posts/${postId}/like`,
        SAVE: (postId: string) => `/posts/${postId}/save`,
        SHARE: (postId: string) => `/posts/${postId}/share`,
    },

    // Comments endpoints
    COMMENTS: {
        LIST: '/comments',
        CREATE: '/comments',
        BY_ID: (id: string) => `/comments/${id}`,
        BY_POST: (postId: string) => `/comments/post/${postId}`,
        COUNT: (postId: string) => `/comments/post/${postId}/count`,
        REPLY: (commentId: string) => `/comments/reply/${commentId}`,
        LOVE: (id: string) => `/comments/${id}/love`,
    },

    // Messages endpoints
    MESSAGES: {
        CREATE: '/messages',
        BY_ID: (id: string) => `/messages/${id}`,
        BY_CONVERSATION: (conversationId: string) => `/messages/conversation/${conversationId}`,
        PINNED: (conversationId: string) => `/messages/conversation/${conversationId}/pinned`,
        SEARCH: (conversationId: string) => `/messages/conversation/${conversationId}/search`,
        READ: (roomId: string) => `/messages/${roomId}/read`,
    },

    // Conversations endpoints
    CONVERSATIONS: {
        LIST: '/conversations',
        CREATE: '/conversations',
        BY_ID: (id: string) => `/conversations/${id}`,
        // Members (new) - use participants routes for now
        MEMBERS: (id: string) => `/conversations/${id}/members`,
        ADD_MEMBER: (id: string) => `/conversations/${id}/participants`,
        REMOVE_MEMBER: (id: string, userId: string) => `/conversations/${id}/participants/${userId}`,
        SET_MEMBER_ROLE: (id: string, userId: string) => `/conversations/${id}/members/${userId}/role`,
        PIN: (id: string) => `/conversations/${id}/pin`,
        UNPIN: (id: string, messageId: string) => `/conversations/${id}/pin/${messageId}`,
        PRIVATE: '/conversations/private',
        BY_GROUP: (groupId: string) => `/conversations/group/${groupId}`,

        PARTICIPANTS: (id: string) => `/conversations/${id}/participants`,
        ADD_PARTICIPANT: (id: string) => `/conversations/${id}/participants`,
        REMOVE_PARTICIPANT: (id: string, userId: string) => `/conversations/${id}/participants/${userId}`,
    },

    // Groups endpoints
    GROUPS: {
        JOINED: '/groups/joined',
        BY_ID: (id: string) => `/groups/${id}`,
        CHECK_ACCESS: (id: string) => `/groups/${id}/access`,
        CREATE: '/groups',
        UPDATE: (id: string) => `/groups/${id}`,
        DELETE: (id: string) => `/groups/${id}`,
        JOIN: (id: string) => `/groups/${id}/join`,
        LEAVE: (id: string) => `/groups/${id}/leave`,
        MEMBERS: (id: string) => `/groups/${id}/members`,
        REMOVE_MEMBER: (id: string, userId: string) => `/groups/${id}/members/${userId}`,
        UPDATE_MEMBER_ROLE: (id: string, userId: string) => `/groups/${id}/members/${userId}/role`,
        INVITE: (id: string) => `/groups/${id}/invite`,
        RECOMMENDED: '/groups/recommended',
        UPDATE_COVER_PHOTO: (id: string) => `/groups/${id}/cover-photo`,
        UPDATE_AVATAR: (id: string) => `/groups/${id}/avatar`,
    },

    // Items endpoints
    ITEMS: {
        LIST: '/items',
        CREATE: '/items',
        BY_ID: (id: string) => `/items/${id}`,
        SEARCH: '/items/search',
        BY_SELLER: (sellerId: string) => `/items/seller/${sellerId}`,
    },

    // Notifications endpoints
    NOTIFICATIONS: {
        BY_RECEIVER: (receiverId: string) => `/notifications/receiver/${receiverId}`,
        BY_SENDER: (senderId: string) => `/notifications/sender/${senderId}`,
        BY_ID: (notificationId: string) => `/notifications/${notificationId}`,
        SEND_REQUEST: '/notifications/request',
        FOLLOW: '/notifications/follow',
        BY_USERS: '/notifications/by-users',
        CREATE: '/notifications',
        READ_ALL: '/notifications/read-all',
        ACCEPT: (notificationId: string) => `/notifications/${notificationId}/accept`,
        DECLINE: (notificationId: string) => `/notifications/${notificationId}/decline`,
    },

    // Search endpoints
    SEARCH: {
        GENERAL: '/search',
        USERS: '/search/users',
        POSTS: '/search/posts',
        GROUPS: '/search/groups',
    },

    // Upload endpoints
    UPLOAD: {
        IMAGE: '/uploads/image',
        VIDEO: '/uploads/video',
    },

    // Image endpoints
    IMAGES: {
        BY_ID: (id: string) => `/images/${id}`,
        DELETE: '/images',
    },

    // Location endpoints
    LOCATIONS: {
        LIST: '/locations',
    },

    // Follow endpoints
    FOLLOWS: {
        FOLLOWINGS: (userId: string) => `/follows/${userId}/followings`,
        FOLLOW: '/follows',
        UNFOLLOW: (userId: string) => `/follows/${userId}`,
    },

    // Categories endpoints
    CATEGORIES: {
        LIST: '/categories',
        ALL: '/categories/all',
        SEARCH: '/categories/search',
        BY_SLUG: (slug: string) => `/categories/slug/${slug}`,
        BY_ID: (id: string) => `/categories/${id}`,
    },

    // Admin endpoints
    ADMIN: {
        USERS: '/admin/users',
        POSTS: '/admin/posts',
        GROUPS: '/admin/groups',
        LOCATIONS: '/admin/locations',
        MEDIAS: '/admin/medias',
        CATEGORIES: '/admin/categories',
    },

    // AI endpoints
    AI: {
        HANDBOOK_AI_CHAT: '/handbook-ai/chat',
    },
};
