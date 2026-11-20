import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Bell, Heart, UserPlus, Info, CheckCheck, Trash2, Check, X } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useNetwork } from '@/hooks/useNetwork';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Link, useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '@/utils/formatters';
import { NotificationItem } from '@/types/notification';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();
  const { receivedRequests, acceptRequest, rejectRequest, isAcceptingRequest, isRejectingRequest } =
    useNetwork();

  const [filter, setFilter] = useState<'all' | 'likes' | 'connections'>('all');

  // Synthesize notifications from both recorded events and live incoming requests
  const combinedNotifications = useMemo((): NotificationItem[] => {
    const list: NotificationItem[] = [...notifications];
    const existingReqActorIds = new Set(
      notifications.filter((n) => n.type === 'request').map((n) => n.actorId)
    );

    // Merge any live pending network requests not yet explicitly recorded
    for (const req of receivedRequests) {
      if (!existingReqActorIds.has(req.userId)) {
        list.push({
          id: `live-req-${req.userId}`,
          type: 'request',
          title: 'New Connection Request',
          description: `${req.name || `User ${req.userId}`} sent you an invitation to connect.`,
          time: new Date().toISOString(),
          read: false,
          targetUserId: 0,
          actorId: req.userId,
          actorName: req.name,
          link: '/network',
        });
      }
    }

    // Sort descending by time
    return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [notifications, receivedRequests]);

  // Filter based on active tab
  const filteredList = useMemo(() => {
    switch (filter) {
      case 'likes':
        return combinedNotifications.filter((n) => n.type === 'like');
      case 'connections':
        return combinedNotifications.filter(
          (n) => n.type === 'request' || n.type === 'accept'
        );
      case 'all':
      default:
        return combinedNotifications;
    }
  }, [combinedNotifications, filter]);

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <DashboardLayout showRightSidebar={false}>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-600" />
              Notifications
              {unreadCount > 0 && (
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time activity on your posts and network invitations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                leftIcon={<CheckCheck className="w-3.5 h-3.5 text-brand-600" />}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}

            {combinedNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-slate-400" />}
                className="text-xs text-slate-500 hover:text-rose-600"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Activity ({combinedNotifications.length})
          </button>
          <button
            onClick={() => setFilter('likes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === 'likes'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Post Likes (
            {combinedNotifications.filter((n) => n.type === 'like').length}
            )
          </button>
          <button
            onClick={() => setFilter('connections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filter === 'connections'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Connections (
            {
              combinedNotifications.filter(
                (n) => n.type === 'request' || n.type === 'accept'
              ).length
            }
            )
          </button>
        </div>

        {/* Kafka Microservice Pipeline Context Box */}
        <div className="p-3.5 bg-blue-50/90 rounded-xl border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold text-blue-950">Kafka Event-Driven Architecture: </span>
            <span className="text-blue-800">
              When a member likes your post, <code className="font-mono bg-blue-100 px-1 py-0.2 rounded text-[11px]">post-service</code> publishes a <code className="font-mono bg-blue-100 px-1 py-0.2 rounded text-[11px]">post_liked_topic</code> event to Kafka and synchronizes the notification instantly across the client and <code className="font-mono bg-blue-100 px-1 py-0.2 rounded text-[11px]">notification-service</code>.
            </span>
          </div>
        </div>

        {/* Notifications Stream */}
        {filteredList.length === 0 ? (
          <EmptyState
            icon={filter === 'likes' ? Heart : filter === 'connections' ? UserPlus : Bell}
            title={
              filter === 'likes'
                ? 'No post like notifications yet'
                : filter === 'connections'
                ? 'No connection notifications'
                : 'You are all caught up!'
            }
            description={
              filter === 'likes'
                ? 'When colleagues and connections like your posts, you will see notifications here.'
                : filter === 'connections'
                ? 'Connection invitations and acceptances will appear here.'
                : 'New notifications regarding your posts and professional network will appear in this stream.'
            }
            actionLabel={filter !== 'all' ? 'View All Activity' : undefined}
            onAction={filter !== 'all' ? () => setFilter('all') : undefined}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-100 overflow-hidden">
            {filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                  !item.read ? 'bg-brand-50/40' : ''
                }`}
              >
                {/* Icon indicator */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs ${
                    item.type === 'like'
                      ? 'bg-rose-100 text-rose-600'
                      : item.type === 'request'
                      ? 'bg-brand-100 text-brand-600'
                      : item.type === 'accept'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.type === 'like' && <Heart className="w-5 h-5 fill-rose-600" />}
                  {item.type === 'request' && <UserPlus className="w-5 h-5" />}
                  {item.type === 'accept' && <Check className="w-5 h-5 text-emerald-600" />}
                  {item.type === 'system' && <Bell className="w-5 h-5" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {formatRelativeTime(item.time)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-normal mb-2">
                    {item.description}
                  </p>

                  {/* Actions for connection request */}
                  {item.type === 'request' && item.actorId && (
                    <div
                      className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          acceptRequest(item.actorId!);
                          markAsRead(item.id);
                        }}
                        isLoading={isAcceptingRequest}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                        className="text-xs py-1"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          rejectRequest(item.actorId!);
                          markAsRead(item.id);
                        }}
                        isLoading={isRejectingRequest}
                        leftIcon={<X className="w-3.5 h-3.5" />}
                        className="text-xs py-1"
                      >
                        Ignore
                      </Button>
                    </div>
                  )}

                  {/* Link for likes or other items */}
                  {item.type === 'like' && (
                    <Link
                      to="/feed"
                      className="inline-block text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      View in Feed →
                    </Link>
                  )}
                </div>

                {/* Unread dot */}
                {!item.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-600 flex-shrink-0 mt-2 shadow-xs" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
