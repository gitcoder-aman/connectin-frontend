import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ConnectionTabs } from '@/components/network/ConnectionTabs';
import { NetworkSearch } from '@/components/network/NetworkSearch';
import { PersonCard } from '@/components/network/PersonCard';
import { PersonCardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useNetwork } from '@/hooks/useNetwork';
import { ConnectionTab, Person } from '@/types/connection';
import { Users, UserPlus, Inbox, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const NetworkPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const {
    allPersons,
    firstDegreeConnections,
    sentRequests,
    receivedRequests,
    isLoading,
    refetchAll,
    getConnectionStatus,
    sendRequest,
    isSendingRequest,
    acceptRequest,
    isAcceptingRequest,
    rejectRequest,
    isRejectingRequest,
    removeConnection,
    isRemovingConnection,
  } = useNetwork();

  const [activeTab, setActiveTab] = useState<ConnectionTab>('all');
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Dialog state for removing connection
  const [targetToRemove, setTargetToRemove] = useState<{ userId: number; name: string } | null>(null);

  // Counts
  const counts = {
    all: allPersons.length,
    connected: firstDegreeConnections.length,
    received: receivedRequests.length,
    sent: sentRequests.length,
  };

  // Determine current list by tab
  const currentList = useMemo((): Person[] => {
    switch (activeTab) {
      case 'connected':
        return firstDegreeConnections;
      case 'received':
        return receivedRequests;
      case 'sent':
        return sentRequests;
      case 'all':
      default:
        return allPersons;
    }
  }, [activeTab, firstDegreeConnections, receivedRequests, sentRequests, allPersons]);

  // Filter list by search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        String(p.userId).includes(q)
    );
  }, [currentList, searchQuery]);

  const handleConfirmRemove = () => {
    if (targetToRemove) {
      removeConnection(targetToRemove.userId);
      setTargetToRemove(null);
    }
  };

  return (
    <DashboardLayout showRightSidebar={false}>
      <div className="space-y-4">
        {/* Network Header & Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                Manage Professional Network
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Discover members, respond to invitations, and expand your 1st-degree connections.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchAll()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="self-start sm:self-auto"
            >
              Refresh Network
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <NetworkSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Search in ${activeTab} (${currentList.length} members)...`}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <ConnectionTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        {/* Network Grid Stream */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <PersonCardSkeleton />
            <PersonCardSkeleton />
            <PersonCardSkeleton />
            <PersonCardSkeleton />
          </div>
        ) : filteredList.length === 0 ? (
          <EmptyState
            icon={
              activeTab === 'received'
                ? Inbox
                : activeTab === 'sent'
                ? Send
                : activeTab === 'connected'
                ? Users
                : UserPlus
            }
            title={
              searchQuery
                ? `No members found matching "${searchQuery}"`
                : activeTab === 'received'
                ? 'No pending invitations'
                : activeTab === 'sent'
                ? 'No sent requests'
                : activeTab === 'connected'
                ? 'No connections yet'
                : 'No members discovered'
            }
            description={
              searchQuery
                ? 'Try a different spelling or clear the search query to see all members.'
                : activeTab === 'received'
                ? 'When someone invites you to connect, you will see their invitation here.'
                : activeTab === 'sent'
                ? 'You have not sent any pending connection requests.'
                : activeTab === 'connected'
                ? 'Explore the Discover People tab to find and connect with colleagues.'
                : 'New users will appear here as they register.'
            }
            actionLabel={searchQuery ? 'Clear Search' : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredList.map((person) => (
              <PersonCard
                key={person.userId}
                person={person}
                status={getConnectionStatus(person.userId)}
                onSendRequest={sendRequest}
                onAcceptRequest={acceptRequest}
                onRejectRequest={rejectRequest}
                onRequestRemove={(userId, name) => setTargetToRemove({ userId, name })}
                isLoading={
                  isSendingRequest ||
                  isAcceptingRequest ||
                  isRejectingRequest ||
                  isRemovingConnection
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!targetToRemove}
        onClose={() => setTargetToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Connection"
        message={`Are you sure you want to remove ${targetToRemove?.name || 'this user'} from your 1st-degree connections?`}
        confirmText="Remove Connection"
        variant="danger"
        isLoading={isRemovingConnection}
      />
    </DashboardLayout>
  );
};
