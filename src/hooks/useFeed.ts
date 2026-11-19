import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api/postsApi';
import { PostDto, FeedPost } from '@/types/post';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useNetwork } from './useNetwork';
import { useState, useEffect } from 'react';
import { AUTH_KEYS } from '@/api/client';

export function useFeed() {
  const { user } = useAuth();
  const currentUserId = user?.id || 0;
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const { firstDegreeConnections, userNameMap } = useNetwork();

  // Local state for tracking posts liked by current user
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEYS.LIKED_POSTS);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    return new Set<number>();
  });

  // Save liked posts to storage
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_KEYS.LIKED_POSTS, JSON.stringify(Array.from(likedPostIds)));
    } catch {
      // ignore
    }
  }, [likedPostIds]);

  // Query: Current User's Posts
  const myPostsQuery = useQuery({
    queryKey: ['posts', 'user', currentUserId],
    queryFn: () => postsApi.getAllPostsByUser(currentUserId),
    enabled: currentUserId > 0,
    staleTime: 20000,
  });

  // Query: Feed aggregation from connections
  const feedQuery = useQuery({
    queryKey: ['feed', currentUserId, firstDegreeConnections.map((c) => c.userId).join(',')],
    queryFn: async () => {
      let allPosts: PostDto[] = [];

      // 1. My posts
      try {
        const myPosts = await postsApi.getAllPostsByUser(currentUserId);
        allPosts = allPosts.concat(myPosts);
      } catch (err) {
        console.warn('Failed to load my posts for feed:', err);
      }

      // 2. First-degree connections' posts
      const connectionPromises = firstDegreeConnections.map(async (conn) => {
        try {
          return await postsApi.getAllPostsByUser(conn.userId);
        } catch {
          return [];
        }
      });

      const connectionPostsArrays = await Promise.all(connectionPromises);
      for (const pList of connectionPostsArrays) {
        allPosts = allPosts.concat(pList);
      }

      // 3. Deduplicate by postId
      const seen = new Set<number>();
      const deduped: PostDto[] = [];
      for (const p of allPosts) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          deduped.push(p);
        }
      }

      // 4. Sort descending by creation date
      deduped.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      return deduped;
    },
    enabled: currentUserId > 0,
    staleTime: 15000,
  });

  // Enrich feed posts with author display names and liked state
  const enrichedFeed: FeedPost[] = (feedQuery.data || []).map((post) => ({
    ...post,
    authorName: userNameMap[post.userId] || (post.userId === currentUserId ? user?.name : `User ${post.userId}`),
    isLikedByMe: likedPostIds.has(post.id),
  }));

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, file }: { content: string; file?: File | null }) => {
      return postsApi.createPost(content, file);
    },
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'user', currentUserId] });
      success('Post published successfully to your network!');
    },
    onError: (err: Error) => {
      toastError(err.message || 'Failed to publish post. Please check image format and try again.');
    },
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, isCurrentlyLiked }: { postId: number; isCurrentlyLiked: boolean }) => {
      if (isCurrentlyLiked) {
        await postsApi.unlikePost(postId);
        return { postId, liked: false };
      } else {
        await postsApi.likePost(postId);
        return { postId, liked: true };
      }
    },
    onMutate: async ({ postId, isCurrentlyLiked }) => {
      // Optimistic update
      setLikedPostIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyLiked) {
          next.delete(postId);
        } else {
          next.add(postId);
        }
        return next;
      });
    },
    onError: (err: Error, { postId, isCurrentlyLiked }) => {
      // Revert optimistic update
      setLikedPostIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyLiked) {
          next.add(postId);
        } else {
          next.delete(postId);
        }
        return next;
      });
      // If error message indicates already liked or already unliked, sync silently
      if (err.message.includes('not like the Post again')) {
        setLikedPostIds((prev) => new Set(prev).add(postId));
      } else if (err.message.includes('not unlike the Post')) {
        setLikedPostIds((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      } else {
        toastError(err.message || 'Failed to update like status.');
      }
    },
  });

  return {
    posts: enrichedFeed,
    myPosts: myPostsQuery.data || [],
    isLoading: feedQuery.isLoading,
    isRefetching: feedQuery.isRefetching,
    isError: feedQuery.isError,
    error: feedQuery.error as Error | null,
    refetchFeed: feedQuery.refetch,
    createPost: createPostMutation.mutateAsync,
    isCreatingPost: createPostMutation.isPending,
    toggleLike: (postId: number, isCurrentlyLiked: boolean) =>
      toggleLikeMutation.mutate({ postId, isCurrentlyLiked }),
  };
}
