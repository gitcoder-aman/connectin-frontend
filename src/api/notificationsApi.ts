import { apiClient } from './client';

export interface BackendNotification {
  id: number;
  userId: number;
  message: string;
  createdAt: string;
}

export const notificationsApi = {
  /**
   * Fetch all notifications for the given user directly from the backend notification-service.
   * GET /api/v1/notifications/core/users/{userId}
   */
  async getNotificationsByUserId(userId: number): Promise<BackendNotification[]> {
    if (!userId || userId <= 0) return [];
    try {
      const response = await apiClient.get<BackendNotification[]>(
        `/api/v1/notifications/core/users/${userId}`
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.warn('Failed to fetch notifications from backend:', err);
      return [];
    }
  },
};
