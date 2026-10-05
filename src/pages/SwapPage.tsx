import { useState } from 'react';
import { ArrowDown, ArrowLeftRight, Loader2, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/Topbar';
import CurrencyIcon from '@/components/CurrencyIcon';
import { CURRENCIES, convert, getFee, getCurrency } from '@/lib/currencies';
import { formatNumber, formatCurrency } from '@/lib/format';
import { useUserData } from '@/lib/useUserData';
import { useAuth } from '@/context/AuthContext';
import { executeSwap } from '@/lib/walletOps';

export default function SwapPage() {
  const { user } = useAuth();
  const { wallets, refresh } = useUserData();
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const convertedAmount = convert(numAmount, fromCurrency, toCurrency);
  const fee = getFee(numAmount, fromCurrency, toCurrency);
  const rate = convert(1, fromCurrency, toCurrency);

  const fromBalance = wallets.find((w) => w.currency_code === fromCurrency)?.balance ?? 0;
  const totalCost = numAmount + fee;
  const insufficient = numAmount > 0 && totalCost > fromBalance;

  const handleSwap = async () => {
    if (numAmount <= 0) {
      setError('Enter an amount to swap');
      return;
    }
    if (insufficient) {
      setError(`Insufficient ${fromCurrency} balance`);
      return;
    }
    setError('');
    setLoading(true);

    const result = await executeSwap({
      userId: user!.id,
      fromCurrency,
      toCurrency,
      amount: numAmount,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setAmount('');
    await refresh();
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleFlip = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div>
      <PageHeader title="Swap / Convert" subtitle="Exchange between any currency instantly with live rates." />

      <div className="max-w-2xl mx-auto">
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 animate-slide-down">
            <CheckCircle2 size={24} className="text-emerald-500" />
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Swap completed successfully! Your balances have been updated.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600 dark:text-red-400 animate-slide-down">
            {error}
          </div>
        )}

        {/* Swap Card */}
        <div className="glass-card p-6 space-y-4">
          {/* From */}
          <div className="p-5 rounded-2xl bg-navy-100 dark:bg-navy-800/50">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-navy-400">From</label>
              <span className="text-xs text-navy-400">
                Balance: {formatNumber(wallets.find((w) => w.currency_code === fromCurrency)?.balance ?? 0)} {fromCurrency}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-3xl font-bold text-navy-900 dark:text-white placeholder-navy-300 dark:placeholder-navy-600 focus:outline-none"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-navy-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Flip button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleFlip}
              className="w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-all hover:rotate-180 duration-300"
            >
              <ArrowDown size={20} />
            </button>
          </div>

          {/* To */}
          <div className="p-5 rounded-2xl bg-navy-100 dark:bg-navy-800/50">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-navy-400">To</label>
              <span className="text-xs text-navy-400">
                Balance: {formatNumber(wallets.find((w) => w.currency_code === toCurrency)?.balance ?? 0)} {toCurrency}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <p className="flex-1 text-3xl font-bold text-navy-900 dark:text-white">
                {numAmount > 0 ? formatNumber(convertedAmount) : '0.00'}
              </p>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 text-navy-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Details */}
          {numAmount > 0 && (
            <div className="p-4 rounded-xl bg-navy-50 dark:bg-navy-900/50 space-y-2 animate-slide-down">
              <DetailRow label="Exchange Rate" value={`1 ${fromCurrency} = ${formatNumber(rate, 6)} ${toCurrency}`} />
              <DetailRow label="Fee" value={`${formatNumber(fee)} ${fromCurrency}`} />
              <DetailRow label="You Receive" value={`${formatNumber(convertedAmount)} ${toCurrency}`} highlight />
              <DetailRow label="Total Cost" value={`${formatNumber(totalCost)} ${fromCurrency}`} />
              {insufficient && (
                <div className="flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle size={14} />
                  Insufficient {fromCurrency} balance (have {formatNumber(fromBalance)} {fromCurrency})
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSwap}
            disabled={loading || numAmount <= 0 || insufficient}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Swapping...
              </>
            ) : (
              <>
                <Zap size={20} />
                Swap Now
              </>
            )}
          </button>
        </div>

        {/* Rate Cards */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-navy-400 mb-4">Popular Pairs</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { from: 'USD', to: 'KES' },
              { from: 'BTC', to: 'USDT' },
              { from: 'EUR', to: 'USD' },
              { from: 'ETH', to: 'USD' },
            ].map((pair) => (
              <button
                key={`${pair.from}-${pair.to}`}
                onClick={() => { setFromCurrency(pair.from); setToCurrency(pair.to); }}
                className="glass-card p-4 flex items-center justify-between hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-center gap-2">
                  <CurrencyIcon code={pair.from} size={32} />
                  <ArrowLeftRight size={14} className="text-navy-400" />
                  <CurrencyIcon code={pair.to} size={32} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-navy-900 dark:text-white">
                    {formatNumber(convert(1, pair.from, pair.to), 4)}
                  </p>
                  <p className="text-xs text-navy-400">{pair.from}/{pair.to}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-navy-500">{label}</span>
      <span className={highlight ? 'font-bold text-emerald-500' : 'font-medium text-navy-900 dark:text-white'}>{value}</span>
    </div>
  );
}
