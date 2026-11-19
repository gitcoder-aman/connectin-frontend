import React from 'react';
import { useNetwork } from '@/hooks/useNetwork';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { UserPlus, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SidebarRight: React.FC = () => {
  const { user } = useAuth();
  const { allPersons, getConnectionStatus, sendRequest, isSendingRequest } = useNetwork();

  // Find up to 3 people who are not connected
  const suggestions = allPersons
    .filter((p) => p.userId !== user?.id && getConnectionStatus(p.userId) === 'not_connected')
    .slice(0, 3);

  return (
    <aside className="space-y-4">
      {/* People You May Know */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            People you may know
          </h4>
          <Link
            to="/network"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            See all
          </Link>
        </div>

        {suggestions.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">
            No new suggestions right now. You are connected with everyone in the network!
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((person) => (
              <div key={person.userId} className="flex items-start justify-between gap-2.5">
                <Link
                  to={`/profile/${person.userId}`}
                  className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 text-xs hover:scale-105 transition-transform"
                >
                  {getInitials(person.name)}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/profile/${person.userId}`}
                    className="text-xs font-semibold text-slate-900 hover:text-brand-600 hover:underline block truncate"
                  >
                    {person.name || `User ${person.userId}`}
                  </Link>
                  <p className="text-[11px] text-slate-500 truncate">Member #{person.userId}</p>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendRequest(person.userId)}
                    disabled={isSendingRequest}
                    leftIcon={<UserPlus className="w-3 h-3 text-brand-600" />}
                    className="mt-1.5 text-[11px] px-2.5 py-1 h-7"
                  >
                    Connect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Production GKE Deployment Notice Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-1.5 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Production GKE
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Connected to ConnectIn Kubernetes cluster via API Gateway at{' '}
          <code className="text-emerald-400 font-mono text-[11px]">34.95.113.61</code>.
        </p>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero Backend Modifications</span>
        </div>
      </div>

      {/* Mini Footer */}
      <footer className="text-[11px] text-slate-500 space-y-1.5 px-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/network" className="hover:text-brand-600">
            Network
          </Link>
          <Link to="/upload" className="hover:text-brand-600">
            Cloudinary
          </Link>
          <Link to="/notifications" className="hover:text-brand-600">
            Kafka Events
          </Link>
        </div>
        <div>ConnectIn Corporation © 2026. All rights reserved.</div>
      </footer>
    </aside>
  );
};
