import { useState } from 'react';
import {
  User, Mail, Phone, Shield, Lock, Fingerprint, Bell, Smartphone,
  Camera, CheckCircle2, Clock, AlertCircle, Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/Topbar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { ReactNode } from 'react';

export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(profile?.two_factor_enabled ?? false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });

  const handleSave = async () => {
    setSaving(true);
    if (user) {
      await supabase.from('profiles').update({
        full_name: fullName,
        phone,
        two_factor_enabled: twoFAEnabled,
      }).eq('id', user.id);
      await refreshProfile();
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const kycStatus = profile?.kyc_status || 'unverified';

  return (
    <div>
      <PageHeader title="Profile & Security" subtitle="Manage your account details and security settings." />

      <div className="max-w-3xl space-y-6">
        {/* Profile Info */}
        <SettingsSection icon={User} title="Profile Information">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
              {(fullName || user?.email || 'U').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Camera size={16} />
              Change Photo
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" icon={User}>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
            </Field>
            <Field label="Email" icon={Mail}>
              <input type="email" value={user?.email || ''} disabled className="input-field opacity-60" />
            </Field>
            <Field label="Phone" icon={Phone}>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" className="input-field" />
            </Field>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary mt-6 flex items-center gap-2">
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 size={18} />
                Saved!
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </SettingsSection>

        {/* KYC Status */}
        <SettingsSection icon={Shield} title="Identity Verification (KYC)">
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            kycStatus === 'verified' ? 'bg-emerald-500/10' :
            kycStatus === 'pending' ? 'bg-amber-500/10' :
            'bg-navy-100 dark:bg-navy-800/50'
          }`}>
            {kycStatus === 'verified' ? <CheckCircle2 size={24} className="text-emerald-500" /> :
             kycStatus === 'pending' ? <Clock size={24} className="text-amber-500" /> :
             <AlertCircle size={24} className="text-navy-400" />}
            <div>
              <p className="text-sm font-medium text-navy-900 dark:text-white">
                {kycStatus === 'verified' ? 'Identity Verified' :
                 kycStatus === 'pending' ? 'Verification Pending' :
                 'Not Verified'}
              </p>
              <p className="text-xs text-navy-400">
                {kycStatus === 'verified' ? 'Your identity has been confirmed. Full access enabled.' :
                 kycStatus === 'pending' ? 'Your documents are under review (usually 24h).' :
                 'Complete KYC to unlock higher transfer limits.'}
              </p>
            </div>
          </div>
          {kycStatus === 'unverified' && (
            <button className="btn-secondary mt-4 text-sm">Start Verification</button>
          )}
        </SettingsSection>

        {/* Security */}
        <SettingsSection icon={Lock} title="Security Settings">
          <div className="space-y-4">
            <ToggleRow
              icon={Smartphone}
              title="Two-Factor Authentication (2FA)"
              desc="Require a code from Google Authenticator on every login"
              enabled={twoFAEnabled}
              onToggle={() => setTwoFAEnabled(!twoFAEnabled)}
            />
            <ToggleRow
              icon={Fingerprint}
              title="Biometric Login"
              desc="Use fingerprint or face recognition to sign in"
              enabled={biometricEnabled}
              onToggle={() => setBiometricEnabled(!biometricEnabled)}
            />
            <div className="pt-4 border-t border-navy-200 dark:border-navy-800">
              <button className="btn-secondary text-sm">Change Password</button>
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection icon={Bell} title="Notification Preferences">
          <div className="space-y-4">
            <ToggleRow
              icon={Mail}
              title="Email Notifications"
              desc="Transaction alerts and account updates via email"
              enabled={notifications.email}
              onToggle={() => setNotifications({ ...notifications, email: !notifications.email })}
            />
            <ToggleRow
              icon={Bell}
              title="Push Notifications"
              desc="Real-time alerts on your device"
              enabled={notifications.push}
              onToggle={() => setNotifications({ ...notifications, push: !notifications.push })}
            />
            <ToggleRow
              icon={Smartphone}
              title="SMS Notifications"
              desc="Receive alerts via SMS text messages"
              enabled={notifications.sms}
              onToggle={() => setNotifications({ ...notifications, sms: !notifications.sms })}
            />
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <div className="glass-card p-6 border border-red-500/20">
          <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
          <p className="text-sm text-navy-500 dark:text-navy-400 mb-4">
            Sign out of your account on this device.
          </p>
          <button onClick={() => signOut()} className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all active:scale-95 text-sm">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, children }: { icon: typeof User; title: string; children: ReactNode }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Icon size={20} className="text-emerald-500" />
        </div>
        <h2 className="text-lg font-bold text-navy-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof User; children: ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block flex items-center gap-2">
        <Icon size={14} className="text-navy-400" />
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  desc,
  enabled,
  onToggle,
}: {
  icon: typeof Lock;
  title: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${enabled ? 'bg-emerald-500/10' : 'bg-navy-100 dark:bg-navy-800'}`}>
          <Icon size={18} className={enabled ? 'text-emerald-500' : 'text-navy-400'} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-navy-900 dark:text-white">{title}</p>
          <p className="text-xs text-navy-400 truncate">{desc}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-7 rounded-full transition-all duration-200 shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-navy-200 dark:bg-navy-700'}`}
      >
        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${enabled ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
