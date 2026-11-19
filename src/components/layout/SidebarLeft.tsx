import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNetwork } from '@/hooks/useNetwork';
import { getInitials } from '@/utils/formatters';
import { Users, Bookmark, ShieldCheck, Sparkles } from 'lucide-react';

export const SidebarLeft: React.FC = () => {
  const { user } = useAuth();
  const { firstDegreeConnections } = useNetwork();

  return (
    <aside className="space-y-4">
      {/* User Mini Identity Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        {/* Banner */}
        <div className="h-16 w-full bg-gradient-to-r from-brand-600 via-brand-500 to-sky-600 relative" />

        {/* Content */}
        <div className="px-4 pb-4 pt-0 text-center relative">
          <Link
            to="/profile"
            className="w-16 h-16 rounded-full border-2 border-white bg-brand-50 shadow-md text-brand-700 font-bold flex items-center justify-center text-lg mx-auto -mt-8 mb-2 hover:scale-105 transition-transform"
          >
            {getInitials(user?.name)}
          </Link>

          <Link
            to="/profile"
            className="font-bold text-sm text-slate-900 hover:text-brand-600 hover:underline transition-colors block truncate"
          >
            {user?.name}
          </Link>

          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            {user?.headline || 'ConnectIn Professional Member'}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-slate-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-brand-600" /> Connections
            </span>
            <Link
              to="/network"
              className="font-bold text-brand-700 hover:underline"
            >
              {firstDegreeConnections.length}
            </Link>
          </div>
        </div>

        {/* Extra Action Link */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 text-xs">
          <Link
            to="/profile"
            className="text-slate-700 hover:text-brand-600 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Manage My Account</span>
          </Link>
        </div>
      </div>

      {/* Quick Shortcuts Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 text-xs space-y-2.5">
        <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
          Shortcuts
        </div>

        <Link
          to="/network"
          className="flex items-center justify-between text-slate-700 hover:text-brand-600 font-medium py-1 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Grow Network
          </span>
          <span className="text-slate-400">→</span>
        </Link>

        <Link
          to="/upload"
          className="flex items-center justify-between text-slate-700 hover:text-brand-600 font-medium py-1 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Cloud Uploader
          </span>
          <span className="text-slate-400">→</span>
        </Link>

        <div className="flex items-center justify-between text-slate-700 py-1 opacity-70">
          <span className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-slate-400" />
            Saved Posts
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
            Local
          </span>
        </div>
      </div>
    </aside>
  );
};
