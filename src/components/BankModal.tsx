import { useState, useEffect } from 'react';
import { X, Building2, ArrowDownLeft, ArrowUpRight, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/lib/useUserData';
import { executeBank } from '@/lib/walletOps';

type Mode = 'deposit' | 'withdraw';
type Step = 'form' | 'processing' | 'success';

export default function BankModal({
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
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setStep('form');
      setAccountName('');
      setAccountNumber('');
      setBankName('');
      setAmount('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const isDeposit = mode === 'deposit';
  const numAmount = parseFloat(amount) || 0;
  const fee = isDeposit ? 0 : numAmount * 0.008;
  const netAmount = numAmount - fee;

  const handleSubmit = async () => {
    if (!accountName || !accountNumber || !bankName) {
      setError('Fill in all bank details');
      return;
    }
    if (numAmount < 1) {
      setError('Minimum amount is $1');
      return;
    }
    setError('');
    setStep('processing');

    const result = await executeBank({
      userId: user!.id,
      mode,
      accountName,
      accountNumber,
      bankName,
      amount: numAmount,
    });

    if (!result.success) {
      setStep('form');
      setError(result.error);
      return;
    }

    await refresh();
    setTimeout(() => setStep('success'), 1500);
  };

  const Icon = isDeposit ? ArrowDownLeft : ArrowUpRight;
  const title = isDeposit ? 'Deposit from Bank' : 'Withdraw to Bank';
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
                {step === 'form' && 'Enter your bank details'}
                {step === 'processing' && 'Processing...'}
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
              {/* Bank badge */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Building2 size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900 dark:text-white">Bank Transfer</p>
                  <p className="text-xs text-navy-400">Direct {isDeposit ? 'deposit to' : 'withdrawal from'} your USD wallet</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="John Doe"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Kenya Commercial Bank"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="01234567890"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">
                  Amount (USD)
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
                {[50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(String(amt))}
                    className="py-2 rounded-lg bg-navy-100 dark:bg-navy-800 text-sm font-medium text-navy-600 dark:text-navy-300 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all"
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {numAmount > 0 && (
                <div className="p-4 rounded-xl bg-navy-100 dark:bg-navy-800/50 space-y-2 animate-slide-down">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Amount</span>
                    <span className="font-medium text-navy-900 dark:text-white">
                      ${formatNumber(numAmount)}
                    </span>
                  </div>
                  {!isDeposit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-500">Bank Fee</span>
                      <span className="font-medium text-navy-900 dark:text-white">
                      ${formatNumber(fee)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-navy-200 dark:border-navy-700 pt-2 flex justify-between">
                    <span className="text-sm font-medium text-navy-600 dark:text-navy-300">{isDeposit ? 'You Receive' : 'You Withdraw'}</span>
                    <span className="text-sm font-bold text-emerald-500">
                      ${formatNumber(netAmount)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 rounded-xl bg-navy-50 dark:bg-navy-900/50">
                <Shield size={16} className="text-emerald-500 shrink-0" />
                <p className="text-xs text-navy-500">
                  {isDeposit
                    ? 'Funds will be credited to your USD wallet within 1-2 business days.'
                    : 'Funds will be transferred to your bank account within 1-3 business days.'}
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
                {isDeposit ? 'Processing Deposit' : 'Processing Withdrawal'}
              </p>
              <p className="text-sm text-navy-400 text-center">
                {isDeposit
                  ? 'Verifying bank transfer details...'
                  : 'Sending funds to your bank account...'}
              </p>
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
                ${formatNumber(netAmount)} {isDeposit ? 'added to' : 'sent from'} your USD wallet via bank transfer
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
