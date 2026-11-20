export type NotificationType = 'like' | 'request' | 'accept' | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  targetUserId: number;
  actorId?: number;
  actorName?: string;
  postId?: number;
  link?: string;
}
