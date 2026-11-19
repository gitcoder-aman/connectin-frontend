import { apiClient } from './client';
import { Person } from '@/types/connection';

/**
 * Connections Service API Client
 * Routed through Gateway at /api/v1/connections/core/**
 */
export const connectionsApi = {
  /**
   * Get all registered persons across the network
   * GET /api/v1/connections/core/all
   */
  async getAllPersons(): Promise<Person[]> {
    const response = await apiClient.get<Person[]>('/api/v1/connections/core/all');
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get first-degree connections of a specific user
   * GET /api/v1/connections/core/{userId}/first-degree
   */
  async getFirstDegreeConnections(userId: number): Promise<Person[]> {
    const response = await apiClient.get<Person[]>(
      `/api/v1/connections/core/${userId}/first-degree`
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get outgoing connection requests sent by current user
   * GET /api/v1/connections/core/requests/sent
   */
  async getSentRequests(): Promise<Person[]> {
    const response = await apiClient.get<Person[]>('/api/v1/connections/core/requests/sent');
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get incoming connection requests received by current user
   * GET /api/v1/connections/core/requests/received
   */
  async getReceivedRequests(): Promise<Person[]> {
    const response = await apiClient.get<Person[]>(
      '/api/v1/connections/core/requests/received'
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Send a connection request to a user
   * POST /api/v1/connections/core/request/{userId}
   */
  async sendConnectionRequest(userId: number): Promise<void> {
    await apiClient.post(`/api/v1/connections/core/request/${userId}`);
  },

  /**
   * Accept an incoming connection request
   * POST /api/v1/connections/core/accept/{senderId}
   */
  async acceptConnectionRequest(senderId: number): Promise<void> {
    await apiClient.post(`/api/v1/connections/core/accept/${senderId}`);
  },

  /**
   * Reject an incoming connection request
   * POST /api/v1/connections/core/reject/{senderId}
   */
  async rejectConnectionRequest(senderId: number): Promise<void> {
    await apiClient.post(`/api/v1/connections/core/reject/${senderId}`);
  },

  /**
   * Remove an existing connection
   * DELETE /api/v1/connections/core/remove/{userId}
   */
  async removeConnection(userId: number): Promise<void> {
    await apiClient.delete(`/api/v1/connections/core/remove/${userId}`);
  },
};
