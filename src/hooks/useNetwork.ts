import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionsApi } from '@/api/connectionsApi';
import { Person, ConnectionStatus } from '@/types/connection';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useNotifications } from '@/context/NotificationContext';
import { useMemo } from 'react';

export const NETWORK_QUERY_KEYS = {
  all: ['connections', 'all'] as const,
  firstDegree: (userId: number) => ['connections', 'first-degree', userId] as const,
  sentRequests: ['connections', 'requests', 'sent'] as const,
  receivedRequests: ['connections', 'requests', 'received'] as const,
};

export function useNetwork() {
  const { user } = useAuth();
  const currentUserId = user?.id || 0;
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const { recordRequestNotification, recordAcceptNotification } = useNotifications();

  // All network users
  const allPersonsQuery = useQuery({
    queryKey: NETWORK_QUERY_KEYS.all,
    queryFn: () => connectionsApi.getAllPersons(),
    enabled: currentUserId > 0,
    staleTime: 30000,
  });

  // 1st degree connections of current user (bidirectionally resolved)
  const firstDegreeQuery = useQuery({
    queryKey: NETWORK_QUERY_KEYS.firstDegree(currentUserId),
    queryFn: () => connectionsApi.getBidirectionalConnections(currentUserId, allPersonsQuery.data),
    enabled: currentUserId > 0,
    staleTime: 20000,
  });

  // Outgoing pending requests sent by current user
  const sentRequestsQuery = useQuery({
    queryKey: NETWORK_QUERY_KEYS.sentRequests,
    queryFn: () => connectionsApi.getSentRequests(),
    enabled: currentUserId > 0,
    staleTime: 15000,
  });

  // Incoming pending requests to current user
  const receivedRequestsQuery = useQuery({
    queryKey: NETWORK_QUERY_KEYS.receivedRequests,
    queryFn: () => connectionsApi.getReceivedRequests(),
    enabled: currentUserId > 0,
    staleTime: 15000,
  });

  // Map of userId -> Display Name
  const userNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (user?.id && user?.name) {
      map[user.id] = user.name;
    }
    const all = allPersonsQuery.data || [];
    for (const p of all) {
      if (p.userId && p.name) {
        map[p.userId] = p.name;
      }
    }
    return map;
  }, [allPersonsQuery.data, user]);

  // Sets for quick connection status lookup
  const connectedUserIds = useMemo(() => {
    return new Set((firstDegreeQuery.data || []).map((p) => p.userId));
  }, [firstDegreeQuery.data]);

  const sentRequestUserIds = useMemo(() => {
    return new Set((sentRequestsQuery.data || []).map((p) => p.userId));
  }, [sentRequestsQuery.data]);

  const receivedRequestUserIds = useMemo(() => {
    return new Set((receivedRequestsQuery.data || []).map((p) => p.userId));
  }, [receivedRequestsQuery.data]);

  const getConnectionStatus = (targetUserId: number): ConnectionStatus => {
    if (targetUserId === currentUserId) return 'self';
    if (connectedUserIds.has(targetUserId)) return 'connected';
    if (sentRequestUserIds.has(targetUserId)) return 'pending_sent';
    if (receivedRequestUserIds.has(targetUserId)) return 'pending_received';
    return 'not_connected';
  };

  const invalidateAllNetwork = () => {
    queryClient.invalidateQueries({ queryKey: ['connections'] });
  };

  // Send request mutation
  const sendRequestMutation = useMutation({
    mutationFn: (targetUserId: number) => connectionsApi.sendConnectionRequest(targetUserId),
    onSuccess: (_, targetUserId) => {
      recordRequestNotification(targetUserId, user?.name);
      invalidateAllNetwork();
      const targetName = userNameMap[targetUserId] || `User ${targetUserId}`;
      success(`Connection request sent to ${targetName}.`);
    },
    onError: (err: Error) => {
      toastError(err.message || 'Failed to send connection request.');
    },
  });

  // Accept request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: (senderUserId: number) => connectionsApi.acceptConnectionRequest(senderUserId),
    onSuccess: (_, senderUserId) => {
      // Instantly register in local mutual connections so both sides reflect immediately
      try {
        const storageKey = `connectin_mutual_conns_${currentUserId}`;
        const stored = localStorage.getItem(storageKey);
        const set = new Set<number>(stored ? JSON.parse(stored) : []);
        set.add(senderUserId);
        localStorage.setItem(storageKey, JSON.stringify(Array.from(set)));
      } catch {
        // ignore
      }
      recordAcceptNotification(senderUserId, user?.name);
      invalidateAllNetwork();
      const targetName = userNameMap[senderUserId] || `User ${senderUserId}`;
      success(`You are now connected with ${targetName}!`);
    },
    onError: (err: Error) => {
      toastError(err.message || 'Failed to accept connection request.');
    },
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: (senderUserId: number) => connectionsApi.rejectConnectionRequest(senderUserId),
    onSuccess: () => {
      invalidateAllNetwork();
      success('Connection request declined.');
    },
    onError: (err: Error) => {
      toastError(err.message || 'Failed to decline request.');
    },
  });

  // Remove connection mutation
  const removeConnectionMutation = useMutation({
    mutationFn: (targetUserId: number) => connectionsApi.removeConnection(targetUserId),
    onSuccess: (_, targetUserId) => {
      try {
        const storageKey = `connectin_mutual_conns_${currentUserId}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const set = new Set<number>(JSON.parse(stored));
          set.delete(targetUserId);
          localStorage.setItem(storageKey, JSON.stringify(Array.from(set)));
        }
      } catch {
        // ignore
      }
      invalidateAllNetwork();
      const targetName = userNameMap[targetUserId] || `User ${targetUserId}`;
      success(`Removed connection with ${targetName}.`);
    },
    onError: (err: Error) => {
      toastError(err.message || 'Failed to remove connection.');
    },
  });

  return {
    allPersons: allPersonsQuery.data || [],
    firstDegreeConnections: firstDegreeQuery.data || [],
    sentRequests: sentRequestsQuery.data || [],
    receivedRequests: receivedRequestsQuery.data || [],
    isLoading:
      allPersonsQuery.isLoading ||
      firstDegreeQuery.isLoading ||
      sentRequestsQuery.isLoading ||
      receivedRequestsQuery.isLoading,
    isError:
      allPersonsQuery.isError ||
      firstDegreeQuery.isError ||
      sentRequestsQuery.isError ||
      receivedRequestsQuery.isError,
    refetchAll: () => {
      allPersonsQuery.refetch();
      firstDegreeQuery.refetch();
      sentRequestsQuery.refetch();
      receivedRequestsQuery.refetch();
    },
    userNameMap,
    getConnectionStatus,
    sendRequest: sendRequestMutation.mutate,
    isSendingRequest: sendRequestMutation.isPending,
    acceptRequest: acceptRequestMutation.mutate,
    isAcceptingRequest: acceptRequestMutation.isPending,
    rejectRequest: rejectRequestMutation.mutate,
    isRejectingRequest: rejectRequestMutation.isPending,
    removeConnection: removeConnectionMutation.mutate,
    isRemovingConnection: removeConnectionMutation.isPending,
  };
}
