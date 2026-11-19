import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      success('Account created successfully! Welcome to ConnectIn.');
      navigate('/feed', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Signup failed. Please try a different email address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Make the most of your professional life"
      subtitle="Join millions of professionals connecting, learning, and growing."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Jane Doe"
          leftIcon={<User className="w-4 h-4" />}
        />

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
          label="Password (6+ characters)"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <p className="text-[11px] text-slate-500 leading-normal">
          By clicking Agree & Join, you agree to ConnectIn's User Agreement, Privacy Policy, and Cookie Policy.
        </p>

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
        >
          Agree & Join
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
        Already on ConnectIn?{' '}
        <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};
