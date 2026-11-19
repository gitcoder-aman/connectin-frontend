import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileBioModal } from '@/components/profile/ProfileBioModal';
import { UserPostsList } from '@/components/profile/UserPostsList';
import { useAuth } from '@/context/AuthContext';
import { useNetwork } from '@/hooks/useNetwork';
import { UserProfile } from '@/types/auth';

export const ProfilePage: React.FC = () => {
  const { userId: paramUserId } = useParams<{ userId?: string }>();
  const { user: currentUser, updateLocalProfile } = useAuth();
  const {
    userNameMap,
    firstDegreeConnections,
    getConnectionStatus,
    sendRequest,
    removeConnection,
  } = useNetwork();

  const [isBioModalOpen, setIsBioModalOpen] = useState(false);

  // Target User ID
  const targetUserId = paramUserId ? parseInt(paramUserId, 10) : currentUser?.id || 0;
  const isOwnProfile = !paramUserId || targetUserId === currentUser?.id;

  // Resolved Profile data
  const profile: UserProfile = isOwnProfile && currentUser
    ? currentUser
    : {
        id: targetUserId,
        name: userNameMap[targetUserId] || `User ${targetUserId}`,
        email: `user${targetUserId}@connectin.network`,
        headline: 'Professional on ConnectIn',
        bio: 'ConnectIn member actively connecting and collaborating across the professional graph.',
        location: 'Global Network',
      };

  const connectionStatus = getConnectionStatus(targetUserId);

  return (
    <DashboardLayout showRightSidebar={true}>
      <div className="space-y-6">
        {/* Profile Hero Header */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          connectionsCount={isOwnProfile ? firstDegreeConnections.length : 1}
          connectionStatus={connectionStatus}
          onEditProfile={() => setIsBioModalOpen(true)}
          onConnect={() => sendRequest(targetUserId)}
          onDisconnect={() => removeConnection(targetUserId)}
        />

        {/* User Activity / Posts */}
        <UserPostsList userId={targetUserId} userName={profile.name} />
      </div>

      {/* Edit Bio Modal (for own profile) */}
      {isOwnProfile && currentUser && (
        <ProfileBioModal
          isOpen={isBioModalOpen}
          onClose={() => setIsBioModalOpen(false)}
          profile={currentUser}
          onSave={updateLocalProfile}
        />
      )}
    </DashboardLayout>
  );
};
