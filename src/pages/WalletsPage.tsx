import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, ArrowDownLeft, ArrowUpRight, TrendingUp, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/Topbar';
import CurrencyIcon from '@/components/CurrencyIcon';
import MpesaModal from '@/components/MpesaModal';
import BankModal from '@/components/BankModal';
import { useUserData, getTotalBalanceUSD } from '@/lib/useUserData';
import { formatCurrency, formatNumber } from '@/lib/format';
import { getCurrency, getCurrencyColor } from '@/lib/currencies';
import type { Wallet } from '@/lib/types';

export default function WalletsPage() {
  const { wallets, loading } = useUserData();
  const navigate = useNavigate();
  const totalUSD = getTotalBalanceUSD(wallets);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [mpesaMode, setMpesaMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [bankOpen, setBankOpen] = useState(false);
  const [bankMode, setBankMode] = useState<'deposit' | 'withdraw'>('deposit');

  const grouped = {
    crypto: wallets.filter((w) => w.currency_type === 'crypto'),
    forex: wallets.filter((w) => w.currency_type === 'forex'),
    local: wallets.filter((w) => w.currency_type === 'local'),
  };

  return (
    <div>
      <PageHeader
        title="My Wallets"
        subtitle="Manage all your currency balances in one place."
        action={
          <button onClick={() => navigate('/swap')} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Currency
          </button>
        }
      />

      {/* Summary */}
      <div className="glass-card p-6 mb-8 bg-gradient-to-br from-navy-800 to-navy-950">
        <p className="text-sm text-navy-300 mb-1">Total Portfolio Value</p>
        <p className="text-4xl font-bold text-white">{formatCurrency(totalUSD)}</p>
        <div className="mt-4 flex items-center gap-6">
          <div>
            <p className="text-xs text-navy-400">Active Wallets</p>
            <p className="text-lg font-bold text-white">{wallets.length}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Currencies</p>
            <p className="text-lg font-bold text-white">{new Set(wallets.map((w) => w.currency_code)).size}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400">24h Change</p>
            <p className="text-lg font-bold text-emerald-400">+12.4%</p>
          </div>
        </div>
      </div>

      {/* Wallet Groups */}
      {(['crypto', 'forex', 'local'] as const).map((type) => {
        const list = grouped[type];
        if (list.length === 0) return null;

        return (
          <div key={type} className="mb-8">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4 capitalize flex items-center gap-2">
              {type === 'crypto' && 'Cryptocurrency Wallets'}
              {type === 'forex' && 'Forex Wallets'}
              {type === 'local' && 'Local & Mobile Money Wallets'}
              <span className="text-sm font-normal text-navy-400">({list.length})</span>
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onSend={() => navigate('/dashboard')}
                  onReceive={() => navigate('/transactions')}
                  onMpesaDeposit={() => { setMpesaMode('deposit'); setMpesaOpen(true); }}
                  onMpesaWithdraw={() => { setMpesaMode('withdraw'); setMpesaOpen(true); }}
                  onBankDeposit={() => { setBankMode('deposit'); setBankOpen(true); }}
                  onBankWithdraw={() => { setBankMode('withdraw'); setBankOpen(true); }}
                />
              ))}
            </div>
          </div>
        );
      })}

      {loading && wallets.length === 0 && (
        <div className="py-20 text-center text-navy-400">Loading wallets...</div>
      )}

      {!loading && wallets.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-navy-400 mb-4">No wallets yet</p>
          <button onClick={() => { setMpesaMode('deposit'); setMpesaOpen(true); }} className="btn-primary">Deposit from M-Pesa</button>
        </div>
      )}

      <MpesaModal open={mpesaOpen} mode={mpesaMode} onClose={() => setMpesaOpen(false)} />
      <BankModal open={bankOpen} mode={bankMode} onClose={() => setBankOpen(false)} />
    </div>
  );
}

function WalletCard({
  wallet,
  onSend,
  onReceive,
  onMpesaDeposit,
  onMpesaWithdraw,
  onBankDeposit,
  onBankWithdraw,
}: {
  wallet: Wallet;
  onSend: () => void;
  onReceive: () => void;
  onMpesaDeposit: () => void;
  onMpesaWithdraw: () => void;
  onBankDeposit: () => void;
  onBankWithdraw: () => void;
}) {
  const cur = getCurrency(wallet.currency_code);
  const usdValue = cur ? wallet.balance / cur.rate : 0;
  const color = getCurrencyColor(wallet.currency_code);

  return (
    <div className="glass-card p-5 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CurrencyIcon code={wallet.currency_code} size={44} />
          <div>
            <p className="font-bold text-navy-900 dark:text-white">{wallet.currency_code}</p>
            <p className="text-xs text-navy-400">{wallet.currency_name}</p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-navy-900 dark:text-white">
          {formatNumber(wallet.balance, wallet.balance < 1 ? 6 : 2)} {wallet.currency_code}
        </p>
        <p className="text-sm text-navy-400 flex items-center gap-1 mt-1">
          <TrendingUp size={14} />
          ≈ {formatCurrency(usdValue)}
        </p>
      </div>

      {wallet.currency_code === 'KES' ? (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onMpesaDeposit} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-600/10 text-green-600 dark:text-green-400 text-sm font-medium hover:bg-green-600/20 transition-colors">
            <ArrowDownLeft size={15} />
            M-Pesa In
          </button>
          <button onClick={onMpesaWithdraw} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-600/20 transition-colors">
            <ArrowUpRight size={15} />
            M-Pesa Out
          </button>
        </div>
      ) : wallet.currency_code === 'USD' ? (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onBankDeposit} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-teal-600/10 text-teal-600 dark:text-teal-400 text-sm font-medium hover:bg-teal-600/20 transition-colors">
            <Building2 size={15} />
            Bank In
          </button>
          <button onClick={onBankWithdraw} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-600/20 transition-colors">
            <Building2 size={15} />
            Bank Out
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onSend} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors">
            <Send size={15} />
            Send
          </button>
          <button onClick={onReceive} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-sm font-medium hover:bg-navy-200 dark:hover:bg-navy-700 transition-colors">
            <ArrowDownLeft size={15} />
            Receive
          </button>
        </div>
      )}
    </div>
  );
}
