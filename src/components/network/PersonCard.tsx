import React from 'react';
import { Person, ConnectionStatus } from '@/types/connection';
import { UserPlus, Check, X, Clock, UserMinus, UserCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { getInitials } from '@/utils/formatters';
import { Link } from 'react-router-dom';

interface PersonCardProps {
  person: Person;
  status: ConnectionStatus;
  onSendRequest: (userId: number) => void;
  onAcceptRequest: (userId: number) => void;
  onRejectRequest: (userId: number) => void;
  onRequestRemove: (userId: number, name: string) => void;
  isLoading?: boolean;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  status,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  onRequestRemove,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card hover:border-slate-300 transition-all flex flex-col justify-between items-center text-center relative group">
      {/* Top Banner Accent */}
      <div className="w-full h-14 bg-gradient-to-r from-brand-600 via-brand-500 to-sky-600 rounded-t-lg -mt-4 mb-0" />

      {/* Avatar */}
      <Link
        to={`/profile/${person.userId}`}
        className="w-16 h-16 rounded-full bg-white border-2 border-white shadow-md text-brand-700 font-bold flex items-center justify-center text-base -mt-8 mb-3 hover:scale-105 transition-transform"
      >
        <span className="w-full h-full rounded-full bg-brand-50 flex items-center justify-center">
          {getInitials(person.name)}
        </span>
      </Link>

      {/* User Info */}
      <div className="mb-4 w-full">
        <Link
          to={`/profile/${person.userId}`}
          className="font-semibold text-sm text-slate-900 hover:text-brand-600 hover:underline transition-colors block truncate"
        >
          {person.name || `User ${person.userId}`}
        </Link>
        <p className="text-xs text-slate-500 mt-0.5">Member #{person.userId}</p>

        {/* Status Badge */}
        <div className="mt-2">
          {status === 'connected' && (
            <Badge variant="emerald" size="sm">
              <UserCheck className="w-3 h-3 mr-1 inline" /> 1st Connection
            </Badge>
          )}
          {status === 'pending_sent' && (
            <Badge variant="amber" size="sm">
              <Clock className="w-3 h-3 mr-1 inline" /> Request Sent
            </Badge>
          )}
          {status === 'pending_received' && (
            <Badge variant="brand" size="sm">
              Invitation Received
            </Badge>
          )}
          {status === 'self' && (
            <Badge variant="slate" size="sm">
              You
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
        {status === 'not_connected' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendRequest(person.userId)}
            disabled={isLoading}
            leftIcon={<UserPlus className="w-3.5 h-3.5 text-brand-600" />}
            className="w-full"
          >
            Connect
          </Button>
        )}

        {status === 'pending_received' && (
          <div className="flex items-center gap-2 w-full">
            <Button
              size="sm"
              variant="primary"
              onClick={() => onAcceptRequest(person.userId)}
              disabled={isLoading}
              leftIcon={<Check className="w-3.5 h-3.5" />}
              className="flex-1 text-xs"
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRejectRequest(person.userId)}
              disabled={isLoading}
              leftIcon={<X className="w-3.5 h-3.5 text-rose-500" />}
              className="px-2"
              title="Decline"
            />
          </div>
        )}

        {status === 'pending_sent' && (
          <Button size="sm" variant="ghost" disabled className="w-full text-slate-400">
            Pending
          </Button>
        )}

        {status === 'connected' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRequestRemove(person.userId, person.name)}
            disabled={isLoading}
            leftIcon={<UserMinus className="w-3.5 h-3.5 text-rose-500" />}
            className="w-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs"
          >
            Disconnect
          </Button>
        )}

        {status === 'self' && (
          <Link to="/profile" className="w-full">
            <Button size="sm" variant="ghost" className="w-full text-xs">
              View Profile
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
