import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/api/postsApi';
import { PostCard } from '@/components/feed/PostCard';
import { PostCardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { FileText } from 'lucide-react';
import { useFeed } from '@/hooks/useFeed';

interface UserPostsListProps {
  userId: number;
  userName: string;
}

export const UserPostsList: React.FC<UserPostsListProps> = ({ userId, userName }) => {
  const { toggleLike } = useFeed();

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: () => postsApi.getAllPostsByUser(userId),
    enabled: userId > 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h3 className="text-base font-bold text-slate-900">
          Activity & Posts ({posts.length})
        </h3>
      </div>

      {isLoading ? (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      ) : isError ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {(error as Error)?.message || 'Failed to load user posts from backend.'}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No posts published yet"
          description={`${userName} has not shared any updates or articles on ConnectIn yet.`}
          actionLabel="Refresh Activity"
          onAction={() => refetch()}
        />
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={{
              ...post,
              authorName: userName,
            }}
            onToggleLike={(postId, isLiked) => toggleLike(postId, isLiked)}
          />
        ))
      )}
    </div>
  );
};
