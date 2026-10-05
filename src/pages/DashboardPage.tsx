import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Send, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Plus, Building2,
  TrendingUp, Bitcoin, Banknote, Smartphone, Eye, EyeOff,
} from 'lucide-react';
import { PageHeader } from '@/components/Topbar';
import CurrencyIcon from '@/components/CurrencyIcon';
import StatusBadge from '@/components/StatusBadge';
import TransferModal from '@/components/TransferModal';
import MpesaModal from '@/components/MpesaModal';
import BankModal from '@/components/BankModal';
import { useUserData, getTotalBalanceUSD, getWalletBreakdown, getDistributionData } from '@/lib/useUserData';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatNumber, formatCompact, timeAgo } from '@/lib/format';
import { getCurrencyColor } from '@/lib/currencies';
import { portfolioGrowthData, monthlyTransactionVolume, marketPerformanceData } from '@/lib/mockData';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { wallets, transactions, loading } = useUserData();
  const [showBalance, setShowBalance] = useState(true);
  const [transferOpen, setTransferOpen] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [mpesaMode, setMpesaMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [bankOpen, setBankOpen] = useState(false);
  const [bankMode, setBankMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [txFilter, setTxFilter] = useState<string>('all');
  const navigate = useNavigate();

  const totalUSD = getTotalBalanceUSD(wallets);
  const breakdown = getWalletBreakdown(wallets);
  const distribution = getDistributionData(wallets);

  const filteredTx = transactions.filter((t) => txFilter === 'all' || t.type === txFilter).slice(0, 6);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'there'}`}
        subtitle="Here's what's happening with your accounts today."
        action={
          <button onClick={() => setTransferOpen(true)} className="btn-primary flex items-center gap-2">
            <Send size={18} />
            Send Money
          </button>
        }
      />

      {/* Balance Cards */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Total Balance */}
        <div className="lg:col-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-navy-300">Total Balance</p>
              <button onClick={() => setShowBalance(!showBalance)} className="text-navy-400 hover:text-white">
                {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            <p className="text-4xl font-bold text-white">
              {showBalance ? formatCurrency(totalUSD) : '••••••'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp size={14} />
                +12.4%
              </span>
              <span className="text-xs text-navy-400">vs last month</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button onClick={() => setTransferOpen(true)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <Send size={18} className="text-emerald-400" />
                <span className="text-xs text-navy-200">Send</span>
              </button>
              <button onClick={() => navigate('/transactions')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <ArrowDownLeft size={18} className="text-blue-400" />
                <span className="text-xs text-navy-200">Receive</span>
              </button>
              <button onClick={() => navigate('/swap')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <ArrowLeftRight size={18} className="text-purple-400" />
                <span className="text-xs text-navy-200">Swap</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wallet breakdown */}
        <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
          <WalletBreakdownCard
            icon={Bitcoin}
            label="Crypto Wallet"
            amount={breakdown.crypto}
            color="#f7931a"
            percentage={totalUSD > 0 ? (breakdown.crypto / totalUSD) * 100 : 0}
          />
          <WalletBreakdownCard
            icon={Banknote}
            label="Forex Wallet"
            amount={breakdown.forex}
            color="#22c55e"
            percentage={totalUSD > 0 ? (breakdown.forex / totalUSD) * 100 : 0}
          />
          <WalletBreakdownCard
            icon={Smartphone}
            label="Local Wallet"
            amount={breakdown.local}
            color="#3b82f6"
            percentage={totalUSD > 0 ? (breakdown.local / totalUSD) * 100 : 0}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <QuickAction icon={Send} label="Send Money" onClick={() => setTransferOpen(true)} color="bg-emerald-500" />
        <QuickAction icon={ArrowLeftRight} label="Swap" onClick={() => navigate('/swap')} color="bg-purple-500" />
        <QuickAction icon={ArrowDownLeft} label="M-Pesa In" onClick={() => { setMpesaMode('deposit'); setMpesaOpen(true); }} color="bg-green-600" />
        <QuickAction icon={ArrowUpRight} label="M-Pesa Out" onClick={() => { setMpesaMode('withdraw'); setMpesaOpen(true); }} color="bg-blue-600" />
        <QuickAction icon={Building2} label="Bank In" onClick={() => { setBankMode('deposit'); setBankOpen(true); }} color="bg-teal-600" />
        <QuickAction icon={Building2} label="Bank Out" onClick={() => { setBankMode('withdraw'); setBankOpen(true); }} color="bg-indigo-600" />
        <QuickAction icon={Plus} label="Wallets" onClick={() => navigate('/wallets')} color="bg-amber-500" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Portfolio Growth */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Portfolio Growth</h3>
              <p className="text-xs text-navy-400">Last 6 months</p>
            </div>
            <span className="text-sm font-medium text-emerald-500">+$10,030</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={portfolioGrowthData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334e6815" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${formatCompact(v)}`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Doughnut */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Currency Distribution</h3>
              <p className="text-xs text-navy-400">By USD value</p>
            </div>
          </div>
          {distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {distribution.map((entry) => (
                    <Cell key={entry.code} fill={getCurrencyColor(entry.code)} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-navy-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Market Performance */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Market Performance</h3>
              <p className="text-xs text-navy-400">Today's crypto prices</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={marketPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334e6815" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${formatCompact(v)}`} />
              <Tooltip formatter={(v) => `${formatNumber(Number(v))}`} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="btc" stroke="#f7931a" strokeWidth={2} dot={false} name="BTC" />
              <Line type="monotone" dataKey="eth" stroke="#627eea" strokeWidth={2} dot={false} name="ETH" />
              <Line type="monotone" dataKey="sol" stroke="#9945ff" strokeWidth={2} dot={false} name="SOL" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Volume */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Monthly Transaction Volume</h3>
              <p className="text-xs text-navy-400">Send vs Receive</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyTransactionVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334e6815" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${formatCompact(v)}`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="send" fill="#ef4444" radius={[6, 6, 0, 0]} name="Sent" />
              <Bar dataKey="receive" fill="#10b981" radius={[6, 6, 0, 0]} name="Received" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">Recent Transactions</h3>
          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', 'send', 'receive', 'swap', 'deposit', 'withdraw'].map((f) => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
                  txFilter === f
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'text-navy-500 hover:bg-navy-100 dark:hover:bg-navy-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-navy-400">Loading transactions...</div>
        ) : filteredTx.length === 0 ? (
          <div className="py-12 text-center text-navy-400">
            <p>No transactions yet</p>
            <button onClick={() => { setMpesaMode('deposit'); setMpesaOpen(true); }} className="btn-primary mt-4">
              Deposit from M-Pesa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-200 dark:border-navy-800 text-left">
                  <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Transaction</th>
                  <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Amount</th>
                  <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="border-b border-navy-100 dark:border-navy-800/50 hover:bg-navy-50 dark:hover:bg-navy-800/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center shrink-0">
                          {tx.from_currency && <CurrencyIcon code={tx.from_currency} size={32} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-navy-900 dark:text-white truncate">
                            {tx.recipient_name || `${tx.from_currency} → ${tx.to_currency}`}
                          </p>
                          <p className="text-xs text-navy-400 truncate">{tx.note || tx.recipient_detail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 hidden sm:table-cell">
                      <span className="text-xs font-medium capitalize text-navy-600 dark:text-navy-300">{tx.type}</span>
                    </td>
                    <td className="py-4">
                      <span className={`text-sm font-bold ${tx.type === 'receive' || tx.type === 'deposit' ? 'text-emerald-500' : 'text-navy-900 dark:text-white'}`}>
                        {tx.type === 'receive' || tx.type === 'deposit' ? '+' : '-'}
                        {formatNumber(tx.amount)} {tx.from_currency}
                      </span>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="text-sm text-navy-500">{timeAgo(tx.created_at)}</span>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {transactions.length > 6 && (
          <div className="mt-4 text-center">
            <button onClick={() => navigate('/transactions')} className="btn-ghost text-sm">
              View All Transactions
            </button>
          </div>
        )}
      </div>

      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} />
      <MpesaModal open={mpesaOpen} mode={mpesaMode} onClose={() => setMpesaOpen(false)} />
      <BankModal open={bankOpen} mode={bankMode} onClose={() => setBankOpen(false)} />
    </div>
  );
}

function WalletBreakdownCard({
  icon: Icon,
  label,
  amount,
  color,
  percentage,
}: {
  icon: typeof Bitcoin;
  label: string;
  amount: number;
  color: string;
  percentage: number;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <span className="text-xs font-medium text-navy-400">{percentage.toFixed(1)}%</span>
      </div>
      <p className="text-xs text-navy-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-navy-900 dark:text-white">{formatCurrency(amount)}</p>
      <div className="mt-3 h-1.5 rounded-full bg-navy-100 dark:bg-navy-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  color,
}: {
  icon: typeof Send;
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className="text-sm font-medium text-navy-900 dark:text-white">{label}</span>
    </button>
  );
}
