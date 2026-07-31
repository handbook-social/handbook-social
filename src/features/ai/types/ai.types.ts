export interface AIChatRequest {
    message: string;
    sessionId?: string;
}

export interface AIChatResponse {
    response: string;
    sessionId: string;
}

export interface AIChatSession {
    _id: string;
    userId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface AIChatMessagePart {
    text: string;
}

export interface AIChatMessage {
    _id: string;
    sessionId: string;
    role: 'user' | 'model';
    parts: AIChatMessagePart[];
    createdAt: string;
}

export interface AIChatPaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface AIChatSessionsResponse {
    success: boolean;
    message: string;
    data: AIChatSession[];
    meta: AIChatPaginationMeta;
}

export interface AIChatMessagesResponse {
    success: boolean;
    message: string;
    data: AIChatMessage[];
}
