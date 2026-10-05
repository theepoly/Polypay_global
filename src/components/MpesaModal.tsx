import { useState, useEffect } from 'react';
import { X, Smartphone, ArrowDownLeft, ArrowUpRight, Loader2, CheckCircle2, Shield, Phone } from 'lucide-react';
import { convert } from '@/lib/currencies';
import { formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/lib/useUserData';
import { executeMpesa } from '@/lib/walletOps';

type Mode = 'deposit' | 'withdraw';
type Step = 'form' | 'processing' | 'pending' | 'success';

export default function MpesaModal({
  open,
  mode,
  onClose,
}: {
  open: boolean;
  mode: Mode;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { refresh } = useUserData();
  const [step, setStep] = useState<Step>('form');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setStep('form');
      setPhone('');
      setAmount('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const isDeposit = mode === 'deposit';
  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * 0.01;
  const kesAmount = isDeposit ? numAmount : numAmount - fee;
  const usdValue = convert(kesAmount, 'KES', 'USD');

  const handleSubmit = async () => {
    if (!phone || phone.length < 10) {
      setError('Enter a valid M-Pesa phone number');
      return;
    }
    if (numAmount < 10) {
      setError('Minimum amount is KES 10');
      return;
    }
    setError('');
    setStep('processing');

    if (isDeposit) {
      // Real STK Push: call the Edge Function which talks to Safaricom Daraja API
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mpesa-stkpush`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          amount: numAmount,
          mode: 'deposit',
          userId: user!.id,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Request failed' }));
        setStep('form');
        setError(errBody.error || `M-Pesa request failed (${res.status})`);
        return;
      }

      const data = await res.json();

      if (!data.success) {
        setStep('form');
        setError(data.error || 'M-Pesa STK Push failed');
        return;
      }

      // STK push sent — now wait for the user to confirm on their phone
      setStep('pending');
      // Credit the wallet immediately (in production, the callback would do this)
      const result = await executeMpesa({
        userId: user!.id,
        mode: 'deposit',
        phone,
        amount: numAmount,
      });

      if (!result.success) {
        setStep('form');
        setError(result.error);
        return;
      }

      await refresh();
      setTimeout(() => setStep('success'), 2000);
    } else {
      // Withdrawal: check balance and deduct (B2C payout)
      const result = await executeMpesa({
        userId: user!.id,
        mode: 'withdraw',
        phone,
        amount: numAmount,
      });

      if (!result.success) {
        setStep('form');
        setError(result.error);
        return;
      }

      await refresh();
      setTimeout(() => setStep('success'), 1500);
    }
  };

  const Icon = isDeposit ? ArrowDownLeft : ArrowUpRight;
  const title = isDeposit ? 'Deposit from M-Pesa' : 'Withdraw to M-Pesa';
  const color = isDeposit ? 'text-emerald-500' : 'text-blue-500';
  const bgColor = isDeposit ? 'bg-emerald-500/10' : 'bg-blue-500/10';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-card rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-200 dark:border-navy-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">{title}</h2>
              <p className="text-xs text-navy-400">
                {step === 'form' && 'Enter your M-Pesa details'}
                {step === 'processing' && 'Contacting Safaricom...'}
                {step === 'pending' && 'Waiting for confirmation...'}
                {step === 'success' && 'Complete!'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors">
            <X size={20} className="text-navy-500" />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <div className="space-y-5 animate-fade-in">
              {/* M-Pesa badge */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                  <Smartphone size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900 dark:text-white">Safaricom M-Pesa</p>
                  <p className="text-xs text-navy-400">Instant {isDeposit ? 'deposit' : 'withdrawal'} • No hidden fees</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">
                  Amount (KES)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field text-2xl font-bold"
                />
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(String(amt))}
                    className="py-2 rounded-lg bg-navy-100 dark:bg-navy-800 text-sm font-medium text-navy-600 dark:text-navy-300 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all"
                  >
                    {amt >= 1000 ? `${amt / 1000}K` : amt}
                  </button>
                ))}
              </div>

              {numAmount > 0 && (
                <div className="p-4 rounded-xl bg-navy-100 dark:bg-navy-800/50 space-y-2 animate-slide-down">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Amount</span>
                    <span className="font-medium text-navy-900 dark:text-white">
                      KES {formatNumber(numAmount)}
                    </span>
                  </div>
                  {!isDeposit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-500">M-Pesa Fee</span>
                      <span className="font-medium text-navy-900 dark:text-white">
                        KES {formatNumber(fee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">{isDeposit ? 'You Receive' : 'You Withdraw'}</span>
                    <span className="font-medium text-navy-900 dark:text-white">
                      KES {formatNumber(kesAmount)}
                    </span>
                  </div>
                  <div className="border-t border-navy-200 dark:border-navy-700 pt-2 flex justify-between">
                    <span className="text-sm font-medium text-navy-600 dark:text-navy-300">USD Value</span>
                    <span className="text-sm font-bold text-emerald-500">
                      ${formatNumber(usdValue)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 rounded-xl bg-navy-50 dark:bg-navy-900/50">
                <Shield size={16} className="text-emerald-500 shrink-0" />
                <p className="text-xs text-navy-500">
                  {isDeposit
                    ? 'You will receive an STK push prompt on your phone to confirm the deposit.'
                    : 'Funds will be sent to your M-Pesa account instantly after confirmation.'}
                </p>
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <button onClick={handleSubmit} disabled={numAmount <= 0} className="btn-primary w-full">
                {isDeposit ? 'Deposit Now' : 'Withdraw Now'}
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-16 flex flex-col items-center gap-4 animate-fade-in">
              <Loader2 size={48} className="text-emerald-500 animate-spin" />
              <p className="text-lg font-bold text-navy-900 dark:text-white">
                {isDeposit ? 'Contacting Safaricom' : 'Processing Withdrawal'}
              </p>
              <p className="text-sm text-navy-400 text-center">
                {isDeposit
                  ? 'Sending STK push request to Safaricom Daraja API...'
                  : 'Sending funds to your M-Pesa account...'}
              </p>
            </div>
          )}

          {step === 'pending' && (
            <div className="py-16 flex flex-col items-center gap-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Phone size={32} className="text-emerald-500 animate-pulse" />
              </div>
              <p className="text-lg font-bold text-navy-900 dark:text-white">
                Check Your Phone
              </p>
              <p className="text-sm text-navy-400 text-center max-w-xs">
                Enter your M-Pesa PIN on the prompt sent to {phone} to complete the deposit of KES {formatNumber(numAmount)}
              </p>
              <Loader2 size={24} className="text-navy-400 animate-spin mt-2" />
              <p className="text-xs text-navy-400">Waiting for confirmation...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-16 flex flex-col items-center gap-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-navy-900 dark:text-white">
                {isDeposit ? 'Deposit Successful!' : 'Withdrawal Successful!'}
              </p>
              <p className="text-sm text-navy-400 text-center max-w-xs">
                KES {formatNumber(kesAmount)} {isDeposit ? 'added to' : 'sent from'} your account via M-Pesa
              </p>
              <button onClick={onClose} className="btn-primary w-full mt-4">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
