'use client';
import { useAuth } from '@/core/context/AuthContext';
import { useFriendSuggestions } from '@/features/friend';
import { useSendFriendRequest } from '@/features/notification';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { useDismissedSuggestions } from '@/shared/hooks/useDismissedSuggestions';
import { Icons } from '../ui';
import { Button } from '../ui/Button';

const SkeletonCard = () => (
    <div className="dark:border-dark-border flex min-w-[140px] animate-pulse flex-col items-center gap-2 rounded-2xl border border-border bg-white p-4 dark:bg-dark-secondary-1">
        <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-dark-hover-1" />
        <div className="h-3 w-20 rounded bg-gray-200 dark:bg-dark-hover-1" />
        <div className="h-3 w-14 rounded bg-gray-200 dark:bg-dark-hover-1" />
        <div className="h-8 w-full rounded-xl bg-gray-200 dark:bg-dark-hover-1" />
    </div>
);

const FriendSuggestionsCard: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();

    const { data: suggestionsData, isLoading } = useFriendSuggestions(10, !!user?.id);

    const frozenRef = useRef<typeof suggestionsData>(undefined);
    if (!frozenRef.current && suggestionsData && suggestionsData.length > 0) {
        frozenRef.current = suggestionsData;
    }
    const suggestions = frozenRef.current || [];

    const { mutate: sendFriendRequest } = useSendFriendRequest();
    const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());

    // Persistent dismiss via localStorage with TTL
    const { isDismissed, dismiss } = useDismissedSuggestions();

    const scrollRef = useRef<HTMLDivElement>(null);

    if (!user) return null;

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: dir === 'left' ? -320 : 320,
            behavior: 'smooth',
        });
    };

    const visibleSuggestions = suggestions.filter((s) => !isDismissed(s._id));

    if (!isLoading && visibleSuggestions.length === 0) return null;

    return (
        <div className="dark:border-dark-border my-4 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm dark:bg-dark-secondary-1">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-primary-1/10 flex h-8 w-8 items-center justify-center rounded-full">
                        <Icons.PersonAdd className="h-4 w-4 text-primary-1" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold">Gợi ý kết bạn</h2>
                        <p className="text-[11px] text-secondary-1">Những người bạn có thể biết</p>
                    </div>
                </div>

                {/* Scroll controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => scroll('left')}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-hover-1 transition hover:bg-hover-2 dark:bg-dark-hover-1 dark:hover:bg-dark-hover-2"
                    >
                        <Icons.ArrowBack className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-hover-1 transition hover:bg-hover-2 dark:bg-dark-hover-1 dark:hover:bg-dark-hover-2"
                    >
                        <Icons.ArrowForward className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Cards row — horizontal scroll */}
            <div
                ref={scrollRef}
                className="scrollbar-none flex gap-3 overflow-x-auto pb-1"
                style={{ scrollbarWidth: 'none' }}
            >
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                    : visibleSuggestions.map((suggestion) => {
                          const hasSent = sentRequestIds.has(suggestion._id);

                          return (
                              <div
                                  key={suggestion._id}
                                  className="dark:border-dark-border dark:hover:shadow-dark group relative flex min-w-[140px] flex-col items-center gap-2 rounded-2xl border border-border bg-gradient-to-b from-white to-gray-50/50 p-4 transition hover:shadow-md dark:from-dark-secondary-1 dark:to-dark-secondary-2"
                              >
                                  {/* Close/dismiss button — hides for 7 days */}
                                  <button
                                      className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-secondary-1 opacity-0 transition hover:bg-hover-1 group-hover:opacity-100 dark:hover:bg-dark-hover-1"
                                      title="Ẩn gợi ý trong 7 ngày"
                                      onClick={() => dismiss(suggestion._id, 'dismiss')}
                                  >
                                      <Icons.Close className="h-3 w-3" />
                                  </button>

                                  {/* Avatar */}
                                  <div
                                      className="relative cursor-pointer"
                                      onClick={() => router.push(`/profile/${suggestion._id}`)}
                                  >
                                      <Image
                                          className="group-hover:ring-primary-1/30 h-16 w-16 rounded-full object-cover ring-2 ring-white ring-offset-1 transition dark:ring-dark-secondary-1"
                                          src={suggestion.avatar || ''}
                                          alt={suggestion.name || ''}
                                          width={64}
                                          height={64}
                                      />
                                      {suggestion.isOnline && (
                                          <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400 dark:border-dark-secondary-1" />
                                      )}
                                  </div>

                                  {/* Name */}
                                  <div
                                      className="flex cursor-pointer flex-col items-center"
                                      onClick={() => router.push(`/profile/${suggestion._id}`)}
                                  >
                                      <span className="max-w-[120px] truncate text-center text-xs font-semibold">
                                          {suggestion.name}
                                      </span>
                                      {suggestion.username && (
                                          <span className="max-w-[120px] truncate text-center text-[10px] text-secondary-1">
                                              @{suggestion.username}
                                          </span>
                                      )}
                                  </div>

                                  {/* Add friend button */}
                                  <Button
                                      variant={hasSent ? 'secondary' : 'primary'}
                                      size="sm"
                                      disabled={hasSent}
                                      className={cn(
                                          'w-full rounded-xl text-xs transition-all',
                                          hasSent ? 'cursor-default opacity-70' : 'hover:scale-[1.02] active:scale-95'
                                      )}
                                      onClick={() => {
                                          if (!hasSent && user?.id) {
                                              sendFriendRequest(
                                                  {
                                                      senderId: user.id,
                                                      receiverId: suggestion._id,
                                                  },
                                                  {
                                                      onSuccess: () => {
                                                          // Track locally for immediate UI update
                                                          setSentRequestIds((prev) =>
                                                              new Set(prev).add(suggestion._id)
                                                          );
                                                          // Also persist to localStorage (30d TTL)
                                                          // so card won't reappear on next visit
                                                          dismiss(suggestion._id, 'sent');
                                                      },
                                                  }
                                              );
                                          }
                                      }}
                                  >
                                      {hasSent ? (
                                          <span className="flex items-center gap-1">
                                              <Icons.Tick className="h-3 w-3" />
                                              Đã gửi
                                          </span>
                                      ) : (
                                          <span className="flex items-center gap-1">
                                              <Icons.PersonAdd className="h-3 w-3" />
                                              Kết bạn
                                          </span>
                                      )}
                                  </Button>
                              </div>
                          );
                      })}
            </div>
        </div>
    );
};

export default FriendSuggestionsCard;
