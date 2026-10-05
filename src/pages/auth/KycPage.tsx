import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, IdCard, Camera, CheckCircle2, Loader2, Shield, ArrowRight } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function KycPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'id' | 'selfie' | 'done'>('id');
  const [idType, setIdType] = useState('passport');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    if (step === 'id') {
      setStep('selfie');
    } else {
      if (user) {
        await supabase.from('profiles').update({ kyc_status: 'pending' }).eq('id', user.id);
        await refreshProfile();
      }
      setStep('done');
    }
  };

  const handleSkip = () => {
    if (user) {
      supabase.from('profiles').update({ kyc_status: 'unverified' }).eq('id', user.id);
    }
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Verify your identity" subtitle="Complete KYC verification to unlock higher transfer limits.">
      {step === 'done' ? (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">Verification Submitted!</h3>
            <p className="mt-2 text-sm text-navy-500 dark:text-navy-400 max-w-xs">
              Your documents are being reviewed. We'll notify you within 24 hours. You can continue using your account in the meantime.
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full flex items-center justify-center gap-2">
            Go to Dashboard
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full ${step === 'id' ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
            <div className={`flex-1 h-2 rounded-full ${step === 'selfie' ? 'bg-emerald-500' : 'bg-navy-200 dark:bg-navy-800'}`} />
          </div>

          {step === 'id' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">Document Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['passport', 'driver_license', 'national_id'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setIdType(type)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                        idType === type
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-navy-200 dark:border-navy-700 text-navy-500'
                      }`}
                    >
                      {type === 'passport' ? 'Passport' : type === 'driver_license' ? "Driver's License" : 'National ID'}
                    </button>
                  ))}
                </div>
              </div>

              <UploadZone icon={IdCard} label="Upload ID Document" desc="Front side of your document (JPG, PNG, PDF — max 10MB)" onUpload={handleUpload} loading={loading} />
            </div>
          )}

          {step === 'selfie' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                <Shield size={20} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-navy-600 dark:text-navy-300">
                  Take a clear selfie in good lighting. Make sure your face is centered and visible.
                </p>
              </div>
              <UploadZone icon={Camera} label="Upload Selfie" desc="A clear photo of your face" onUpload={handleUpload} loading={loading} />
              <button onClick={() => setStep('id')} className="text-sm text-navy-500 hover:text-navy-700 dark:hover:text-navy-200 transition-colors">
                Back to ID upload
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-navy-200 dark:border-navy-800">
            <button onClick={handleSkip} className="text-sm text-navy-500 hover:text-navy-700 dark:hover:text-navy-200 transition-colors w-full text-center">
              Skip for now — I'll do this later
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

function UploadZone({
  icon: Icon,
  label,
  desc,
  onUpload,
  loading,
}: {
  icon: typeof Upload;
  label: string;
  desc: string;
  onUpload: () => void;
  loading: boolean;
}) {
  const [uploaded, setUploaded] = useState(false);

  const handleClick = () => {
    setUploaded(true);
    onUpload();
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full p-8 rounded-2xl border-2 border-dashed border-navy-200 dark:border-navy-700 hover:border-emerald-500 transition-all duration-300 group"
    >
      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-emerald-500 animate-spin" />
          <p className="text-sm text-navy-500">Uploading...</p>
        </div>
      ) : uploaded ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 size={32} className="text-emerald-500" />
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Uploaded successfully</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon size={28} className="text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-navy-900 dark:text-white">{label}</p>
          <p className="text-xs text-navy-400 text-center max-w-xs">{desc}</p>
        </div>
      )}
    </button>
  );
}
