import React from 'react';
import { ConnectionTab } from '@/types/connection';
import { Users, UserCheck, Inbox, Send } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ConnectionTabsProps {
  activeTab: ConnectionTab;
  onTabChange: (tab: ConnectionTab) => void;
  counts: {
    all: number;
    connected: number;
    received: number;
    sent: number;
  };
}

export const ConnectionTabs: React.FC<ConnectionTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const tabs = [
    {
      id: 'all' as ConnectionTab,
      label: 'Discover People',
      icon: Users,
      count: counts.all,
    },
    {
      id: 'connected' as ConnectionTab,
      label: 'Connections',
      icon: UserCheck,
      count: counts.connected,
    },
    {
      id: 'received' as ConnectionTab,
      label: 'Invitations',
      icon: Inbox,
      count: counts.received,
      highlight: counts.received > 0,
    },
    {
      id: 'sent' as ConnectionTab,
      label: 'Sent Requests',
      icon: Send,
      count: counts.sent,
    },
  ];

  return (
    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
              isActive
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{tab.label}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                isActive
                  ? 'bg-brand-700/60 text-white'
                  : tab.highlight
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
