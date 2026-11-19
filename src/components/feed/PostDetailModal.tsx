import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/api/postsApi';
import { Modal } from '@/components/common/Modal';
import { formatDateTime, getInitials } from '@/utils/formatters';
import { Skeleton } from '@/components/common/Skeleton';
import { AlertCircle } from 'lucide-react';

interface PostDetailModalProps {
  postId: number | null;
  onClose: () => void;
  authorName?: string;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  postId,
  onClose,
  authorName,
}) => {
  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.getPostById(postId!),
    enabled: !!postId,
  });

  return (
    <Modal
      isOpen={!!postId}
      onClose={onClose}
      title={`Post Details #${postId || ''}`}
      maxWidth="lg"
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      ) : isError ? (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>{(error as Error)?.message || 'Failed to fetch post details from backend.'}</div>
        </div>
      ) : post ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm">
              {getInitials(authorName)}
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900">
                {authorName || `User ${post.userId}`}
              </div>
              <div className="text-xs text-slate-500">
                Created: {formatDateTime(post.createdAt)}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {post.imageUrl && !post.imageUrl.includes('post-fallback.png') && (
            <div className="rounded-lg overflow-hidden border border-slate-200">
              <img src={post.imageUrl} alt="Post media" className="w-full max-h-80 object-cover" />
            </div>
          )}

          {/* Raw JSON viewer for developers / inspection */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Backend Response Payload (GET /api/v1/posts/core/{post.id})
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 text-xs rounded-lg overflow-x-auto font-mono">
              {JSON.stringify(post, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
