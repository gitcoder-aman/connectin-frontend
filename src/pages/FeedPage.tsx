import React, { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { CreatePostCard } from '@/components/feed/CreatePostCard';
import { PostCard } from '@/components/feed/PostCard';
import { PostDetailModal } from '@/components/feed/PostDetailModal';
import { PostCardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useFeed } from '@/hooks/useFeed';
import { useNetwork } from '@/hooks/useNetwork';
import { Rss, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const FeedPage: React.FC = () => {
  const {
    posts,
    isLoading,
    isRefetching,
    isError,
    error,
    refetchFeed,
    createPost,
    isCreatingPost,
    toggleLike,
  } = useFeed();

  const { userNameMap } = useNetwork();
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const selectedAuthorName = selectedPostId
    ? posts.find((p) => p.id === selectedPostId)?.authorName ||
      userNameMap[posts.find((p) => p.id === selectedPostId)?.userId || 0]
    : undefined;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Post Creation Composer */}
        <CreatePostCard onSubmit={createPost} isLoading={isCreatingPost} />

        {/* Feed Header with Refresh */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-brand-600 rounded-full" />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Main Network Feed</h2>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchFeed()}
            disabled={isRefetching}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-brand-600' : ''}`} />}
            className="text-xs text-slate-600"
          >
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Feed Posts Stream */}
        {isLoading ? (
          <div className="space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : isError ? (
          <div className="p-6 bg-white rounded-xl border border-rose-200 text-center space-y-3">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Failed to load network feed</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {error?.message || 'Could not fetch posts from backend. Please ensure the postService is reachable.'}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetchFeed()}>
              Retry Feed
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Rss}
            title="No posts in your network yet"
            description="Be the first to share an update, or connect with colleagues in My Network to see their posts here."
            actionLabel="Refresh Feed"
            onAction={() => refetchFeed()}
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleLike={toggleLike}
                onViewDetails={(id) => setSelectedPostId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Inspection Modal */}
      <PostDetailModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
        authorName={selectedAuthorName}
      />
    </DashboardLayout>
  );
};
