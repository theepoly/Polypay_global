import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Phone, Check } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passwordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (!passwordValid) {
      setError('Password does not meet security requirements');
      return;
    }
    if (!agree) {
      setError('Please agree to the Terms and Privacy Policy');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/kyc');
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join PolyPay and start sending money across every currency.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600 dark:text-red-400 animate-slide-down">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="input-field pl-11"
              required
            />
          </div>
        </div>

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
          <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">Phone Number</label>
          <div className="relative">
            <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 7XX XXX XXX"
              className="input-field pl-11"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
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

          {password.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs animate-slide-down">
              <PasswordCheck ok={passwordChecks.length} label="8+ characters" />
              <PasswordCheck ok={passwordChecks.upper} label="Uppercase letter" />
              <PasswordCheck ok={passwordChecks.number} label="Number" />
              <PasswordCheck ok={passwordChecks.special} label="Special character" />
            </div>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm text-navy-600 dark:text-navy-300 cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="w-4 h-4 rounded accent-emerald-500 mt-0.5"
          />
          <span>
            I agree to the{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Terms of Service</span>
            {' '}and{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Privacy Policy</span>
          </span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        <p className="text-center text-sm text-navy-500 dark:text-navy-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function PasswordCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-navy-400'}`}>
      <Check size={14} className={ok ? 'opacity-100' : 'opacity-30'} />
      {label}
    </div>
  );
}
