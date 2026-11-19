import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/feed';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      success('Welcome back to ConnectIn!');
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Stay updated on your professional network and connections."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
        New to ConnectIn?{' '}
        <Link to="/signup" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
          Join now
        </Link>
      </div>
    </AuthLayout>
  );
};
