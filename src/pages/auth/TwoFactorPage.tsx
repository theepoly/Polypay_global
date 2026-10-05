import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, CheckCircle2, KeyRound, Smartphone } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function TwoFactorPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    if (user) {
      await supabase.from('profiles').update({ two_factor_enabled: true }).eq('id', user.id);
      await refreshProfile();
    }
    setLoading(false);
    setVerified(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (verified) {
    return (
      <AuthLayout title="2FA Enabled!" subtitle="Your account is now protected with two-factor authentication.">
        <div className="flex flex-col items-center text-center py-12 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
            <CheckCircle2 size={36} className="text-emerald-500" />
          </div>
          <p className="text-sm text-navy-500 dark:text-navy-400">Redirecting to your dashboard...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set up 2FA" subtitle="Enter the 6-digit code from your Google Authenticator app.">
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-navy-100 dark:bg-navy-800/50">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Smartphone size={24} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-navy-900 dark:text-white">Google Authenticator</p>
            <p className="text-xs text-navy-400">Scan the QR code in your authenticator app</p>
          </div>
        </div>

        {/* Mock QR */}
        <div className="flex justify-center">
          <div className="w-40 h-40 rounded-2xl bg-white p-4 shadow-lg">
            <div className="w-full h-full rounded-lg bg-navy-900 flex items-center justify-center">
              <KeyRound size={48} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-3 block text-center">
            Enter verification code
          </label>
          <div className="flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                maxLength={1}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white dark:bg-navy-900 border-2 border-navy-200 dark:border-navy-700 focus:border-emerald-500 focus:outline-none text-navy-900 dark:text-white transition-all"
              />
            ))}
          </div>
        </div>

        <button onClick={handleVerify} disabled={loading || otp.join('').length < 6} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Shield size={18} />
              Verify & Enable 2FA
            </>
          )}
        </button>

        <button onClick={() => navigate('/dashboard')} className="text-sm text-navy-500 hover:text-navy-700 dark:hover:text-navy-200 transition-colors w-full text-center">
          Skip for now
        </button>
      </div>
    </AuthLayout>
  );
}
