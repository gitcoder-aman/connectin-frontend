import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <Link to="/login" className="flex items-center gap-1.5 group">
          <div className="w-9 h-9 rounded-lg bg-brand-600 text-white font-black flex items-center justify-center text-xl shadow-md group-hover:bg-brand-700 transition-colors">
            in
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
            Connect<span className="text-brand-600">In</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span className="hidden sm:inline">Production GKE Microservices</span>
        </div>
      </header>

      {/* Auth Card Container */}
      <main className="max-w-md w-full mx-auto my-auto">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 text-center text-xs text-slate-500">
        ConnectIn Professional Social Network © 2026 • Powered by Spring Boot Microservices
      </footer>
    </div>
  );
};
