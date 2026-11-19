import React from 'react';
import { Search, X } from 'lucide-react';

interface NetworkSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const NetworkSearch: React.FC<NetworkSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search by name or member ID...',
}) => {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-xs md:text-sm bg-white rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
