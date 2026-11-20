import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bell, UploadCloud, User } from 'lucide-react';
import { useNetwork } from '@/hooks/useNetwork';
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/utils/cn';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { receivedRequests } = useNetwork();
  const { unreadCount } = useNotifications();
  const pendingCount = receivedRequests.length;

  const links = [
    { label: 'Feed', path: '/feed', icon: Home },
    {
      label: 'Network',
      path: '/network',
      icon: Users,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { label: 'Upload', path: '/upload', icon: UploadCloud },
    {
      label: 'Notifs',
      path: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1 flex items-center justify-around">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;

        return (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors relative',
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5 mb-0.5" />
              {link.badge !== undefined && (
                <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white">
                  {link.badge}
                </span>
              )}
            </div>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
