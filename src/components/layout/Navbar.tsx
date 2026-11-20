import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Bell,
  UploadCloud,
  LogOut,
  User,
  Activity,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNetwork } from '@/hooks/useNetwork';
import { useNotifications } from '@/context/NotificationContext';
import { getInitials } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { BackendStatusModal } from '@/components/system/BackendStatusModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { receivedRequests } = useNetwork();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingInvitationsCount = receivedRequests.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/network?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { label: 'Feed', path: '/feed', icon: Home },
    {
      label: 'My Network',
      path: '/network',
      icon: Users,
      badge: pendingInvitationsCount > 0 ? pendingInvitationsCount : undefined,
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: 'Media Uploader', path: '/upload', icon: UploadCloud },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2 sm:gap-4">
            {/* Logo & Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Link to="/feed" className="flex items-center gap-1.5 flex-shrink-0 group">
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white font-black flex items-center justify-center text-lg shadow-sm group-hover:bg-brand-700 transition-colors">
                  in
                </div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight hidden sm:inline">
                  Connect<span className="text-brand-600">In</span>
                </span>
              </Link>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs hidden md:block">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search professionals..."
                  className="w-full bg-[#edf3f8] text-xs text-slate-800 placeholder-slate-500 pl-9 pr-3 py-1.5 rounded-md border-transparent focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none"
                />
              </form>
            </div>

            {/* Desktop Navigation Items */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex flex-col items-center justify-center min-w-[64px] py-1 px-2 text-[11px] font-medium transition-colors relative group',
                      isActive
                        ? 'text-slate-900 font-semibold border-b-2 border-slate-900 -mb-[1px]'
                        : 'text-slate-500 hover:text-slate-900'
                    )}
                  >
                    <div className="relative">
                      <Icon className={cn('w-5 h-5 mb-0.5', isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900')} />
                      {item.badge !== undefined && (
                        <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="h-7 w-[1px] bg-slate-200 mx-1" />

              {/* Architecture Probe Pill */}
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors border border-slate-200"
                title="View GKE Microservices Architecture"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xl:inline">API Status</span>
              </button>

              {/* User Profile Dropdown */}
              <div className="relative ml-1">
                <button
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="flex flex-col items-center justify-center py-1 px-2 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center mb-0.5 shadow-xs">
                    {getInitials(user?.name)}
                  </div>
                  <span className="truncate max-w-[60px]">{user?.name?.split(' ')[0] || 'Me'}</span>
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-dropdown border border-slate-200 z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-sm border border-brand-200">
                          {getInitials(user?.name)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-sm text-slate-900 truncate">
                            {user?.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                          <div className="text-[10px] text-brand-600 font-semibold mt-0.5">
                            Member #{user?.id}
                          </div>
                        </div>
                      </div>

                      <div className="p-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          <span>View Full Profile</span>
                        </Link>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsStatusModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
                        >
                          <Activity className="w-4 h-4 text-emerald-600" />
                          <span>GKE Architecture & APIs</span>
                        </button>
                      </div>

                      <div className="p-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile Header Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
                title="API Status"
              >
                <Activity className="w-5 h-5 text-emerald-600" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 animate-in slide-in-from-top duration-150">
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg mb-2">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                {getInitials(user?.name)}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm text-slate-900 truncate">{user?.name}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </div>
            </div>

            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              <User className="w-4 h-4 text-brand-600" />
              <span>My Profile</span>
            </Link>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Backend GKE Microservices Architecture Modal */}
      <BackendStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </>
  );
};
