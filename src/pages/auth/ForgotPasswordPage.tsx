import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import AuthLayout from './AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a secure reset link.">
      {sent ? (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">Check your inbox</h3>
            <p className="mt-2 text-sm text-navy-500 dark:text-navy-400 max-w-xs">
              We've sent a password reset link to <span className="font-medium text-navy-700 dark:text-navy-200">{email}</span>
            </p>
          </div>
          <Link to="/login" className="btn-primary w-full text-center block">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-navy-500 dark:text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 transition-colors">
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
