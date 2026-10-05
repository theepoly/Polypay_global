import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Fingerprint } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your PolyPay account to continue.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600 dark:text-red-400 animate-slide-down">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">Email Address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field pl-11"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-navy-600 dark:text-navy-300">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pl-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 dark:hover:text-navy-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded accent-emerald-500" />
          Keep me signed in
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        <button type="button" className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 font-medium hover:bg-navy-100 dark:hover:bg-navy-800 transition-all">
          <Fingerprint size={20} className="text-emerald-500" />
          Use Biometric Login
        </button>

        <p className="text-center text-sm text-navy-500 dark:text-navy-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            Sign up free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
