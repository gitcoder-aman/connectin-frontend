import React, { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Bell, Heart, UserPlus, Info, CheckCheck } from 'lucide-react';
import { useNetwork } from '@/hooks/useNetwork';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '@/utils/formatters';

interface NotificationItem {
  id: string;
  type: 'like' | 'request' | 'post';
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
}

export const NotificationsPage: React.FC = () => {
  const { receivedRequests } = useNetwork();

  // Create notifications from real incoming network connection requests
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const list: NotificationItem[] = receivedRequests.map((p) => ({
      id: `req-${p.userId}`,
      type: 'request',
      title: 'New Connection Request',
      description: `${p.name || `User ${p.userId}`} wants to connect with you.`,
      time: new Date().toISOString(),
      read: false,
      link: '/network',
    }));

    // Example simulated notification illustrating Kafka events
    if (list.length === 0) {
      list.push({
        id: 'system-1',
        type: 'post',
        title: 'Network Activity',
        description: 'Welcome to ConnectIn! Connect with other members to see their posts and receive updates.',
        time: new Date().toISOString(),
        read: false,
        link: '/network',
      });
    }

    return list;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-600" />
              Notifications
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Stay updated with connection invitations and post interactions.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            leftIcon={<CheckCheck className="w-4 h-4 text-brand-600" />}
            className="text-xs"
          >
            Mark all as read
          </Button>
        </div>

        {/* Backend Microservice Architecture Notice */}
        <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Backend Architecture Note: Event-Driven Kafka Service</div>
            <p className="text-blue-800 leading-relaxed">
              ConnectIn's <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">notification-service</code> operates as an event-driven Kafka consumer listening to <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">post_created_topic</code> and <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">post_liked_topic</code>, storing records directly in its PostgreSQL database. A REST retrieval controller is not currently exposed through the API Gateway, so real-time invitations from the connection service and local interactions are surfaced here.
            </p>
          </div>
        </div>

        {/* Notification Stream */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-100 overflow-hidden">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markSingleAsRead(item.id)}
              className={`p-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                !item.read ? 'bg-brand-50/40' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'request'
                    ? 'bg-brand-100 text-brand-600'
                    : item.type === 'like'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {item.type === 'request' && <UserPlus className="w-4 h-4" />}
                {item.type === 'like' && <Heart className="w-4 h-4" />}
                {item.type === 'post' && <Bell className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {formatRelativeTime(item.time)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">{item.description}</p>
                {item.link && (
                  <Link
                    to={item.link}
                    className="inline-block mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    View in Network →
                  </Link>
                )}
              </div>

              {!item.read && (
                <div className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
