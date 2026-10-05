import { useState, useEffect } from 'react';
import { X, ArrowRight, Lock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { CURRENCIES, convert, getFee, getCurrency } from '@/lib/currencies';
import { formatNumber } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/lib/useUserData';
import { executeSend } from '@/lib/walletOps';
import CurrencyIcon from './CurrencyIcon';

type Step = 'details' | 'recipient' | 'confirm' | 'processing' | 'success';

export default function TransferModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { wallets, refresh } = useUserData();
  const [step, setStep] = useState<Step>('details');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientDetail, setRecipientDetail] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const fromBalance = wallets.find((w) => w.currency_code === fromCurrency)?.balance ?? 0;

  useEffect(() => {
    if (open) {
      setStep('details');
      setAmount('');
      setRecipientName('');
      setRecipientDetail('');
      setNote('');
      setPin('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const numAmount = parseFloat(amount) || 0;
  const convertedAmount = convert(numAmount, fromCurrency, toCurrency);
  const fee = getFee(numAmount, fromCurrency, toCurrency);
  const total = numAmount + fee;

  const handleConfirm = async () => {
    if (pin.length < 4) {
      setError('Please enter a valid PIN (at least 4 digits)');
      return;
    }
    if (fromBalance < total) {
      setError(`Insufficient ${fromCurrency} balance. Available: ${formatNumber(fromBalance)} ${fromCurrency}`);
      return;
    }
    setError('');
    setStep('processing');

    const result = await executeSend({
      userId: user!.id,
      fromCurrency,
      toCurrency,
      amount: numAmount,
      recipientName,
      recipientDetail,
      note,
    });

    if (!result.success) {
      setStep('confirm');
      setError(result.error);
      return;
    }

    await refresh();
    setTimeout(() => setStep('success'), 1500);
  };

  const fromCur = getCurrency(fromCurrency);
  const toCur = getCurrency(toCurrency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-card rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-200 dark:border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <ArrowRight size={20} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">Send Money</h2>
              <p className="text-xs text-navy-400">
                {step === 'details' && 'Step 1 of 3 — Transfer Details'}
                {step === 'recipient' && 'Step 2 of 3 — Recipient Info'}
                {step === 'confirm' && 'Step 3 of 3 — Confirm & Secure'}
                {step === 'processing' && 'Processing your transfer...'}
                {step === 'success' && 'Transfer complete!'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors">
            <X size={20} className="text-navy-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Details */}
          {step === 'details' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-navy-600 dark:text-navy-300">From</label>
                  <span className="text-xs text-navy-400">
                    Balance: {formatNumber(fromBalance, fromBalance < 1 ? 6 : 2)} {fromCurrency}
                  </span>
                </div>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="input-field"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
                  <ArrowRight size={18} className="text-white" />
                </div>
                <div className="h-px bg-navy-200 dark:bg-navy-800" />
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">To</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="input-field"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">
                  Amount ({fromCurrency})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field text-2xl font-bold"
                />
                {numAmount > 0 && numAmount + fee > fromBalance && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500 animate-slide-down">
                    <AlertCircle size={14} />
                    Insufficient {fromCurrency} balance (need {formatNumber(total)} {fromCurrency})
                  </div>
                )}
              </div>

              {numAmount > 0 && (
                <div className="p-4 rounded-xl bg-navy-100 dark:bg-navy-800/50 space-y-2 animate-slide-down">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Exchange Rate</span>
                    <span className="font-medium text-navy-900 dark:text-white">
                      1 {fromCurrency} = {formatNumber(convert(1, fromCurrency, toCurrency), 4)} {toCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Fee</span>
                    <span className="font-medium text-navy-900 dark:text-white">
                      {formatNumber(fee)} {fromCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Total Cost</span>
                    <span className="font-medium text-navy-900 dark:text-white">
                      {formatNumber(total)} {fromCurrency}
                    </span>
                  </div>
                  <div className="border-t border-navy-200 dark:border-navy-700 pt-2 flex justify-between">
                    <span className="text-sm font-medium text-navy-600 dark:text-navy-300">Recipient Receives</span>
                    <span className="text-lg font-bold text-emerald-500">
                      {formatNumber(convertedAmount)} {toCurrency}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => numAmount > 0 ? setStep('recipient') : setError('Enter an amount to continue')}
                disabled={numAmount > 0 && numAmount + fee > fromBalance}
                className="btn-primary w-full"
              >
                Continue
              </button>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>
          )}

          {/* Step 2: Recipient */}
          {step === 'recipient' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-navy-100 dark:bg-navy-800/50">
                <CurrencyIcon code={fromCurrency} size={36} />
                <ArrowRight size={16} className="text-navy-400" />
                <CurrencyIcon code={toCurrency} size={36} />
                <div className="ml-auto text-right">
                  <p className="text-sm font-bold text-navy-900 dark:text-white">
                    {formatNumber(convertedAmount)} {toCurrency}
                  </p>
                  <p className="text-xs text-navy-400">from {formatNumber(numAmount)} {fromCurrency}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="John Doe"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">
                  {toCur?.type === 'crypto' ? 'Wallet Address' :
                   toCur?.type === 'local' && (toCurrency === 'MPESA' || toCurrency === 'AIRTEL') ? 'Phone Number' :
                   toCur?.type === 'local' && toCurrency === 'PAYPAL' ? 'PayPal Email' :
                   toCur?.type === 'local' && toCurrency === 'WISE' ? 'Wise Account ID' :
                   toCur?.type === 'local' && toCurrency === 'BANK' ? 'Bank Account Number' :
                   'Account / IBAN'}
                </label>
                <input
                  type="text"
                  value={recipientDetail}
                  onChange={(e) => setRecipientDetail(e.target.value)}
                  placeholder={
                    toCur?.type === 'crypto' ? '0x...' :
                    toCurrency === 'MPESA' || toCurrency === 'AIRTEL' ? '+254 7XX XXX XXX' :
                    toCurrency === 'PAYPAL' ? 'email@example.com' :
                    'Enter account details'
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block">Note (Optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's this for?"
                  className="input-field"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('details')} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={() => recipientName && recipientDetail ? setStep('confirm') : setError('Fill in recipient details')}
                  className="btn-primary flex-1"
                >
                  Review Transfer
                </button>
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-xl bg-navy-100 dark:bg-navy-800/50 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-navy-200 dark:border-navy-700">
                  <CurrencyIcon code={fromCurrency} size={40} />
                  <ArrowRight size={18} className="text-navy-400" />
                  <CurrencyIcon code={toCurrency} size={40} />
                  <div className="ml-auto">
                    <p className="text-lg font-bold text-navy-900 dark:text-white">
                      {formatNumber(convertedAmount)} {toCurrency}
                    </p>
                  </div>
                </div>
                <Row label="From" value={`${formatNumber(numAmount)} ${fromCurrency}`} />
                <Row label="Fee" value={`${formatNumber(fee)} ${fromCurrency}`} />
                <Row label="Total" value={`${formatNumber(total)} ${fromCurrency}`} />
                <Row label="Recipient" value={recipientName} />
                <Row label="Account" value={recipientDetail} />
                {note && <Row label="Note" value={note} />}
              </div>

              <div>
                <label className="text-sm font-medium text-navy-600 dark:text-navy-300 mb-2 block flex items-center gap-2">
                  <Lock size={14} /> Enter your security PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••"
                  className="input-field text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('recipient')} className="btn-secondary flex-1">
                  Back
                </button>
                <button onClick={handleConfirm} className="btn-primary flex-1">
                  Confirm & Send
                </button>
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="py-16 flex flex-col items-center gap-4 animate-fade-in">
              <Loader2 size={48} className="text-emerald-500 animate-spin" />
              <p className="text-lg font-bold text-navy-900 dark:text-white">Processing Transfer</p>
              <p className="text-sm text-navy-400">Securing your transaction on the blockchain...</p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="py-16 flex flex-col items-center gap-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-navy-900 dark:text-white">Transfer Successful!</p>
              <p className="text-sm text-navy-400 text-center max-w-xs">
                {formatNumber(convertedAmount)} {toCurrency} has been sent to {recipientName}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-navy-500">{label}</span>
      <span className="font-medium text-navy-900 dark:text-white text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
