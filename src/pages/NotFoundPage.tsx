import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-6 shadow-sm">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Page Not Found (404)
      </h1>

      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        The link you followed may be broken, or the page may have been removed. Let's get you back to your professional network.
      </p>

      <Link to="/feed">
        <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
          Back to Feed
        </Button>
      </Link>
    </div>
  );
};
