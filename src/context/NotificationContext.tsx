import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { NotificationItem } from '@/types/notification';
import { useAuth } from './AuthContext';

const NOTIFICATIONS_STORAGE_KEY = 'connectin_app_notifications';
const BROADCAST_CHANNEL_NAME = 'connectin_notifications_channel';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  recordLikeNotification: (targetUserId: number, postId: number, postSnippet?: string) => void;
  recordRequestNotification: (targetUserId: number, actorName?: string) => void;
  recordAcceptNotification: (targetUserId: number, actorName?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || 0;

  // Load all raw notifications from localStorage
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Persist all notifications whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(allNotifications));
    } catch {
      // ignore
    }
  }, [allNotifications]);

  // Sync across tabs with BroadcastChannel and storage events
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_NOTIFICATIONS') {
          try {
            const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
            if (stored) {
              setAllNotifications(JSON.parse(stored));
            }
          } catch {
            // ignore
          }
        }
      };
    } catch {
      // BroadcastChannel not supported in some older environments
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NOTIFICATIONS_STORAGE_KEY && e.newValue) {
        try {
          setAllNotifications(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const broadcastChange = () => {
    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({ type: 'SYNC_NOTIFICATIONS' });
      channel.close();
    } catch {
      // ignore
    }
  };

  // Filter notifications addressed to the current logged-in user
  const userNotifications = useMemo(() => {
    const uid = Number(currentUserId);
    if (!uid || uid <= 0) return [];
    return allNotifications
      .filter((n) => Number(n.targetUserId) === uid)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [allNotifications, currentUserId]);

  const unreadCount = useMemo(() => {
    return userNotifications.filter((n) => !n.read).length;
  }, [userNotifications]);

  // Record a post like notification for the post's owner
  const recordLikeNotification = useCallback(
    (targetUserId: number, postId: number, postSnippet?: string) => {
      const actorId = Number(currentUserId);
      const targetId = Number(targetUserId);

      // Do not notify self for liking own post
      if (!actorId || !targetId || targetId === actorId) return;

      let actorName = user?.name || '';
      if (!actorName && user?.email) {
        actorName = user.email.split('@')[0].replace('.', ' ');
      }
      if (!actorName) actorName = `User ${actorId}`;

      const snippetText = postSnippet
        ? postSnippet.length > 50
          ? `${postSnippet.substring(0, 50)}...`
          : postSnippet
        : `post #${postId}`;

      const newNotif: NotificationItem = {
        id: `like-${Date.now()}-${postId}-${actorId}`,
        type: 'like',
        title: 'Post Liked',
        description: `${actorName} liked your post: "${snippetText}"`,
        time: new Date().toISOString(),
        read: false,
        targetUserId: targetId,
        actorId,
        actorName,
        postId,
        link: '/feed',
      };

      setAllNotifications((prev) => {
        // Avoid duplicate notification for same actor, post, and target within 1 hour
        const duplicate = prev.some(
          (n) =>
            n.type === 'like' &&
            n.postId === postId &&
            Number(n.actorId) === actorId &&
            Number(n.targetUserId) === targetId
        );
        if (duplicate) return prev;
        const next = [newNotif, ...prev];
        try {
          localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      broadcastChange();
    },
    [currentUserId, user]
  );

  // Record a connection request notification
  const recordRequestNotification = useCallback(
    (targetUserId: number, actorName?: string) => {
      const actorId = Number(currentUserId);
      const targetId = Number(targetUserId);
      if (!actorId || !targetId || targetId === actorId) return;

      let name = actorName || user?.name || '';
      if (!name && user?.email) {
        name = user.email.split('@')[0].replace('.', ' ');
      }
      if (!name) name = `User ${actorId}`;

      const newNotif: NotificationItem = {
        id: `req-${Date.now()}-${actorId}-${targetId}`,
        type: 'request',
        title: 'New Connection Request',
        description: `${name} sent you a connection request.`,
        time: new Date().toISOString(),
        read: false,
        targetUserId: targetId,
        actorId,
        actorName: name,
        link: '/network',
      };

      setAllNotifications((prev) => {
        const duplicate = prev.some(
          (n) =>
            n.type === 'request' &&
            Number(n.actorId) === actorId &&
            Number(n.targetUserId) === targetId
        );
        if (duplicate) return prev;
        const next = [newNotif, ...prev];
        try {
          localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      broadcastChange();
    },
    [currentUserId, user]
  );

  // Record an accepted connection notification
  const recordAcceptNotification = useCallback(
    (targetUserId: number, actorName?: string) => {
      const actorId = Number(currentUserId);
      const targetId = Number(targetUserId);
      if (!actorId || !targetId || targetId === actorId) return;

      let name = actorName || user?.name || '';
      if (!name && user?.email) {
        name = user.email.split('@')[0].replace('.', ' ');
      }
      if (!name) name = `User ${actorId}`;

      const newNotif: NotificationItem = {
        id: `accept-${Date.now()}-${actorId}-${targetId}`,
        type: 'accept',
        title: 'Connection Accepted',
        description: `${name} accepted your connection request. You are now 1st-degree connections.`,
        time: new Date().toISOString(),
        read: false,
        targetUserId: targetId,
        actorId,
        actorName: name,
        link: '/network',
      };

      setAllNotifications((prev) => {
        const next = [newNotif, ...prev];
        try {
          localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      broadcastChange();
    },
    [currentUserId, user]
  );

  const markAsRead = useCallback((id: string) => {
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    broadcastChange();
  }, []);

  const markAllAsRead = useCallback(() => {
    setAllNotifications((prev) =>
      prev.map((n) => (n.targetUserId === currentUserId ? { ...n, read: true } : n))
    );
    broadcastChange();
  }, [currentUserId]);

  const clearAll = useCallback(() => {
    setAllNotifications((prev) =>
      prev.filter((n) => n.targetUserId !== currentUserId)
    );
    broadcastChange();
  }, [currentUserId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications: userNotifications,
        unreadCount,
        recordLikeNotification,
        recordRequestNotification,
        recordAcceptNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
