import React from 'react';
import { UserProfile } from '@/types/auth';
import { getInitials } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Edit3, MapPin, Mail, ShieldCheck, Users, UserPlus, UserMinus, Clock } from 'lucide-react';
import { ConnectionStatus } from '@/types/connection';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  connectionsCount: number;
  connectionStatus?: ConnectionStatus;
  onEditProfile?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  connectionsCount,
  connectionStatus,
  onEditProfile,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden mb-6">
      {/* Cover Banner */}
      <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-brand-700 via-brand-600 to-sky-700 relative">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Profile Body */}
      <div className="px-6 pb-6 pt-0 relative">
        {/* Avatar & Edit Button Row */}
        <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-brand-50 shadow-lg text-brand-700 font-extrabold flex items-center justify-center text-2xl sm:text-4xl">
            {getInitials(profile.name)}
          </div>

          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditProfile}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit Intro
              </Button>
            ) : (
              <>
                {connectionStatus === 'not_connected' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onConnect}
                    leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  >
                    Connect
                  </Button>
                )}
                {connectionStatus === 'connected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDisconnect}
                    leftIcon={<UserMinus className="w-3.5 h-3.5 text-rose-500" />}
                  >
                    Disconnect
                  </Button>
                )}
                {connectionStatus === 'pending_sent' && (
                  <Button variant="ghost" size="sm" disabled leftIcon={<Clock className="w-3.5 h-3.5" />}>
                    Pending
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* User Titles & Details */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{profile.name}</h1>
            <Badge variant="brand" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1 inline text-brand-600" />
              Verified Member #{profile.id}
            </Badge>
          </div>

          <p className="text-sm font-medium text-slate-700 max-w-2xl leading-normal">
            {profile.headline || 'Member at ConnectIn Network'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {profile.location}
              </span>
            )}
            {profile.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {profile.email}
              </span>
            )}
            <span className="flex items-center gap-1 font-semibold text-brand-700">
              <Users className="w-3.5 h-3.5 text-brand-600" />
              {connectionsCount} connection{connectionsCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* About / Bio */}
          {profile.bio && (
            <div className="pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <h4 className="font-semibold text-slate-900 mb-1">About</h4>
              <p className="whitespace-pre-line">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
