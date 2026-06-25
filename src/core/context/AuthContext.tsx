'use client';
import { axiosAuth } from '@/core/api/axios-instance';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/Button';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    username?: string;
    avatar?: string;
    role?: string;
    isBlocked?: boolean;
    lastAccessed?: Date;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    setAccessToken: (token: string | null) => void;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<void>;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Decode JWT token to get user info
 */
function decodeToken(token: string): User | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const decoded = JSON.parse(jsonPayload);

        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            return null;
        }

        return {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            username: decoded.username || '',
            avatar: decoded.picture || '',
            role: decoded.role || 'user',
            isBlocked: decoded.isBlocked || false,
            lastAccessed: new Date(decoded.lastAccessed),
        };
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

/**
 * Auth Provider - Manages user authentication state
 * Uses access token in memory + refresh token in httpOnly cookie
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUserState] = useState<User | null>(null);
    const [accessToken, setAccessTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
    const [missedDays, setMissedDays] = useState(0);
    const queryClient = useQueryClient();
    const initializingRef = useRef(false);

    // Kiểm tra thời gian vắng mặt (>= 7 ngày)
    useEffect(() => {
        if (user && user.lastAccessed) {
            const lastAccessDate = new Date(user.lastAccessed);
            if (!isNaN(lastAccessDate.getTime())) {
                const timeDiff = Date.now() - lastAccessDate.getTime();
                const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

                if (daysDiff >= 7) {
                    const hasShown = sessionStorage.getItem('handbook_welcome_shown');
                    if (!hasShown) {
                        setMissedDays(daysDiff);
                        setShowWelcomeDialog(true);
                        sessionStorage.setItem('handbook_welcome_shown', 'true');
                    }
                }
            }
        }
    }, [user]);

    // Refresh access token from cookie on mount
    useEffect(() => {
        const initAuth = async () => {
            if (typeof window === 'undefined' || initializingRef.current) {
                return;
            }

            initializingRef.current = true;

            try {
                const response = await axiosAuth.post('/auth/refresh');
                const newAccessToken = response.data.data.accessToken;

                setAccessTokenState(newAccessToken);
                const decodedUser = decodeToken(newAccessToken);
                setUserState(decodedUser);
            } catch (error) {
                console.log('No valid refresh token');
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const setAccessToken = useCallback((token: string | null) => {
        setAccessTokenState(token);
        setIsLoading(false);
        if (token) {
            const decodedUser = decodeToken(token);
            setUserState(decodedUser);
        } else {
            setUserState(null);
        }
    }, []);

    const refreshAccessToken = useCallback(async () => {
        try {
            const response = await axiosAuth.post('/auth/refresh');
            const newAccessToken = response.data.data.accessToken;
            setAccessTokenState(newAccessToken);
            const decodedUser = decodeToken(newAccessToken);
            setUserState(decodedUser);
        } catch (error) {
            setAccessTokenState(null);
            setUserState(null);
            throw error;
        }
    }, []);

    const setUser = useCallback((newUser: User | null) => {
        setUserState(newUser);
    }, []);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const openLoginModal = useCallback(() => setShowLoginModal(true), []);
    const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

    const logout = useCallback(async () => {
        try {
            await axiosAuth.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAccessTokenState(null);
            setUserState(null);
            setShowWelcomeDialog(false);
            sessionStorage.removeItem('handbook_welcome_shown');
            queryClient.clear();
        }
    }, [queryClient]);

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isLoading,
                isAuthenticated: !!user,
                setUser,
                setAccessToken,
                logout,
                refreshAccessToken,
                openLoginModal,
                closeLoginModal,
            }}
        >
            {children}

            {/* Dialog welcomeback */}
            <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="mb-2 text-xl font-bold">Chào mừng quay trở lại!</DialogTitle>
                        <DialogDescription className="mb-6 text-sm leading-relaxed">
                            Bạn đã đi vắng <b>{missedDays}</b> ngày. Có rất nhiều thông tin mới đang chờ bạn cập nhật
                            đó!
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="w-full sm:justify-center">
                        <Button variant="primary" className="h-11 w-full" onClick={() => setShowWelcomeDialog(false)}>
                            Okay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog yêu cầu đăng nhập */}
            <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
                <DialogContent className="sm:max-w-sm rounded-2xl p-6 border-none shadow-2xl bg-white dark:bg-dark-secondary-1">
                    <div className="flex flex-col items-center text-center">
                        {/* Icon Lock với Flat Circle Background */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30 text-primary-2 mb-4">
                            <Lock className="h-5 w-5" />
                        </div>
                        
                        <DialogHeader className="border-b-0 pb-0 text-center items-center">
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                                Yêu cầu đăng nhập
                            </DialogTitle>
                            <DialogDescription className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                Tính năng này chỉ dành cho thành viên của Handbook. Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục trải nghiệm đầy đủ các tính năng.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Footer với các nút được thiết kế đồng bộ dạng phẳng */}
                        <div className="mt-6 flex w-full flex-col gap-2">
                            <Link href="/auth/login" onClick={closeLoginModal} className="w-full">
                                <Button variant="primary" className="h-11 w-full font-semibold rounded-xl border-none shadow-sm transition-all duration-200">
                                    Đăng nhập ngay
                                </Button>
                            </Link>
                            <Button 
                                variant="ghost" 
                                className="h-11 w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-dark-hover-1 font-medium rounded-xl border-none transition-all duration-200" 
                                onClick={closeLoginModal}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
