import React, { useState } from 'react';
import { FeedPost } from '@/types/post';
import { Heart, MessageSquare, Share2, Info, Eye } from 'lucide-react';
import { formatRelativeTime, getInitials } from '@/utils/formatters';
import { useAuth } from '@/context/AuthContext';
import { Lightbox } from '@/components/common/Lightbox';
import { useToast } from '@/context/ToastContext';
import { Link } from 'react-router-dom';

interface PostCardProps {
  post: FeedPost;
  onToggleLike: (postId: number, isCurrentlyLiked: boolean) => void;
  onViewDetails?: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onToggleLike, onViewDetails }) => {
  const { user } = useAuth();
  const { info } = useToast();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showCommentsNotice, setShowCommentsNotice] = useState(false);

  const isMe = user?.id === post.userId;
  const isLiked = !!post.isLikedByMe;

  // Check if image is real or fallback
  const hasRealImage =
    post.imageUrl &&
    !post.imageUrl.includes('post-fallback.png') &&
    post.imageUrl.startsWith('http');

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    info('Post link copied to clipboard!');
  };

  return (
    <>
      <article className="bg-white rounded-xl border border-slate-200 shadow-card p-4 mb-4 hover:border-slate-300 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/profile/${post.userId}`}
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 text-sm hover:ring-2 hover:ring-brand-400 transition-all"
            >
              {getInitials(post.authorName)}
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${post.userId}`}
                  className="font-semibold text-sm text-slate-900 hover:text-brand-600 hover:underline transition-colors"
                >
                  {post.authorName || `User ${post.userId}`}
                </Link>
                {isMe && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded border border-brand-200">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>User #{post.userId}</span>
                <span>•</span>
                <span>{formatRelativeTime(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick detail inspector */}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(post.id)}
              className="text-slate-400 hover:text-brand-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              title="Inspect API Post Data"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Post Text Content */}
        {post.content && (
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed mb-3">
            {post.content}
          </p>
        )}

        {/* Post Image Media */}
        {hasRealImage && (
          <div className="mb-3 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 max-h-96 flex items-center justify-center group cursor-pointer">
            <img
              src={post.imageUrl!}
              alt="Post media"
              loading="lazy"
              onClick={() => setLightboxOpen(true)}
              className="w-full max-h-96 object-cover group-hover:scale-[1.01] transition-transform duration-200"
              onError={(e) => {
                // Hide if broken
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Comments Backend Notice Accordion */}
        {showCommentsNotice && (
          <div className="mb-3 p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Backend Architectural Note:</span> The ConnectIn
              microservices architecture currently exposes post creation, retrieval, and likes.
              Comments entities and endpoints are not yet supported by the post microservice.
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-600">
          {/* Like Button */}
          <button
            onClick={() => onToggleLike(post.id, isLiked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              isLiked
                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Comments Button (With backend explanation) */}
          <button
            onClick={() => setShowCommentsNotice((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            title="Comments Status"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </article>

      {/* Lightbox for full size photo */}
      {hasRealImage && (
        <Lightbox
          src={lightboxOpen ? post.imageUrl! : null}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};
