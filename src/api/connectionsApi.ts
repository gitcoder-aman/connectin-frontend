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
   * Resolves mutual 1-to-1 connections in both directions.
   * In Neo4j, accept creates a directed edge (sender -> receiver).
   * This method merges outgoing connections (current -> friend) with incoming
   * connections (friend -> current) so both users see each other in their network.
   */
  async getBidirectionalConnections(
    currentUserId: number,
    cachedPersons?: Person[]
  ): Promise<Person[]> {
    if (!currentUserId || currentUserId <= 0) return [];

    const storageKey = `connectin_mutual_conns_${currentUserId}`;
    let locallyKnownIds = new Set<number>();
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        locallyKnownIds = new Set(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // 1. Fetch direct outgoing first-degree connections
    let direct: Person[] = [];
    try {
      direct = await this.getFirstDegreeConnections(currentUserId);
    } catch (err) {
      console.warn('Failed to fetch direct first degree connections:', err);
    }

    const resultMap = new Map<number, Person>();
    for (const p of direct) {
      if (p.userId && p.userId !== currentUserId) {
        resultMap.set(p.userId, p);
      }
    }

    // 2. Discover incoming reverse connections from candidates
    let candidateList = cachedPersons && cachedPersons.length > 0 ? cachedPersons : [];
    if (candidateList.length === 0) {
      try {
        candidateList = await this.getAllPersons();
      } catch {
        candidateList = [];
      }
    }

    const personsMap = new Map<number, Person>();
    for (const p of candidateList) {
      if (p.userId) {
        personsMap.set(p.userId, p);
      }
    }

    // Check users who might have connected to currentUserId
    const candidatesToCheck = candidateList.filter(
      (p) => p.userId && p.userId !== currentUserId && !resultMap.has(p.userId)
    );

    if (candidatesToCheck.length > 0) {
      const checks = candidatesToCheck.map(async (candidate) => {
        try {
          const theirConns = await this.getFirstDegreeConnections(candidate.userId);
          const isConnectedToMe = theirConns.some((c) => c.userId === currentUserId);
          if (isConnectedToMe) {
            resultMap.set(candidate.userId, candidate);
          }
        } catch {
          // If check failed but was in local cache, retain it
          if (locallyKnownIds.has(candidate.userId)) {
            resultMap.set(candidate.userId, candidate);
          }
        }
      });

      await Promise.allSettled(checks);
    }

    // Also include any locally confirmed mutual connections if present in personsMap
    for (const cachedId of locallyKnownIds) {
      if (!resultMap.has(cachedId) && personsMap.has(cachedId)) {
        resultMap.set(cachedId, personsMap.get(cachedId)!);
      }
    }

    // Persist discovered mutual IDs for instantaneous hydration
    try {
      const idsToSave = Array.from(resultMap.keys());
      localStorage.setItem(storageKey, JSON.stringify(idsToSave));
    } catch {
      // ignore
    }

    return Array.from(resultMap.values());
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
