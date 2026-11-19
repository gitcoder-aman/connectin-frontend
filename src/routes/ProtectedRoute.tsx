import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-lg mb-4 shadow-md animate-pulse">
          in
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading ConnectIn session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
