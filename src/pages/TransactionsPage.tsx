import { useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Download, FileText, Search, Filter, ArrowUpDown } from 'lucide-react';
import { PageHeader } from '@/components/Topbar';
import CurrencyIcon from '@/components/CurrencyIcon';
import StatusBadge from '@/components/StatusBadge';
import { useUserData } from '@/lib/useUserData';
import { formatCurrency, formatNumber, formatDate, timeAgo } from '@/lib/format';
import { getCurrencyColor } from '@/lib/currencies';
import { spendingAnalysisData } from '@/lib/mockData';
import type { TransactionType } from '@/lib/types';

export default function TransactionsPage() {
  const { transactions, loading } = useUserData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filtered = transactions
    .filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          tx.recipient_name?.toLowerCase().includes(s) ||
          tx.note?.toLowerCase().includes(s) ||
          tx.from_currency?.toLowerCase().includes(s) ||
          tx.to_currency?.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .sort((a, b) => sortOrder === 'desc' ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const totalSent = transactions.filter((t) => t.type === 'send' || t.type === 'withdraw').reduce((s, t) => s + t.amount, 0);
  const totalReceived = transactions.filter((t) => t.type === 'receive' || t.type === 'deposit').reduce((s, t) => s + t.amount, 0);

  const exportCSV = () => {
    const headers = ['Date,Type,From,To,Amount,Fee,Status,Recipient,Note'];
    const rows = filtered.map((tx) =>
      `${formatDate(tx.created_at)},${tx.type},${tx.from_currency ?? ''},${tx.to_currency ?? ''},${tx.amount},${tx.fee},${tx.status},${tx.recipient_name ?? ''},${tx.note ?? ''}`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polypay-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div>
      <PageHeader
        title="Transaction History"
        subtitle="View, filter, and export all your transactions."
        action={
          <div className="flex gap-2">
            <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
              <Download size={16} />
              CSV
            </button>
            <button onClick={exportPDF} className="btn-secondary flex items-center gap-2 text-sm">
              <FileText size={16} />
              PDF
            </button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard label="Total Sent" amount={totalSent} color="text-red-500" />
        <SummaryCard label="Total Received" amount={totalReceived} color="text-emerald-500" />
        <SummaryCard label="Net Flow" amount={totalReceived - totalSent} color="text-blue-500" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Spending Analysis</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={spendingAnalysisData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334e6815" />
              <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={12} width={100} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="amount" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Transaction Types</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={spendingAnalysisData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="amount"
                nameKey="category"
                label={(entry: { name?: string }) => entry.name || ''}
              >
                {spendingAnalysisData.map((_, i) => (
                  <Cell key={i} fill={['#10b981', '#3b82f6', '#f7931a', '#a855f7', '#ef4444'][i % 5]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="input-field pl-11"
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field sm:w-40">
            <option value="all">All Types</option>
            <option value="send">Send</option>
            <option value="receive">Receive</option>
            <option value="swap">Swap</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-40">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <ArrowUpDown size={16} />
            {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-navy-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-navy-400">
            <Filter size={32} className="mx-auto mb-3 opacity-30" />
            No transactions match your filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-200 dark:border-navy-800 text-left">
                  <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Transaction</th>
                  <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Amount</th>
                  <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider hidden md:table-cell">Fee</th>
                  <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id} className="border-b border-navy-100 dark:border-navy-800/50 hover:bg-navy-50 dark:hover:bg-navy-800/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {tx.from_currency && <CurrencyIcon code={tx.from_currency} size={36} />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-navy-900 dark:text-white truncate">
                            {tx.recipient_name || `${tx.from_currency} → ${tx.to_currency}`}
                          </p>
                          <p className="text-xs text-navy-400 truncate">
                            {tx.note || tx.recipient_detail || timeAgo(tx.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 hidden sm:table-cell">
                      <span className="text-xs font-medium capitalize text-navy-600 dark:text-navy-300">{tx.type}</span>
                    </td>
                    <td className="py-4">
                      <span className={`text-sm font-bold ${(tx.type as TransactionType) === 'receive' || (tx.type as TransactionType) === 'deposit' ? 'text-emerald-500' : 'text-navy-900 dark:text-white'}`}>
                        {(tx.type as TransactionType) === 'receive' || (tx.type as TransactionType) === 'deposit' ? '+' : '-'}
                        {formatNumber(tx.amount)} {tx.from_currency}
                      </span>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="text-sm text-navy-500">{formatNumber(tx.fee)} {tx.from_currency}</span>
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      <span className="text-sm text-navy-500">{formatDate(tx.created_at)}</span>
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
      </div>
    </div>
  );
}

function SummaryCard({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs text-navy-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{formatCurrency(amount)}</p>
    </div>
  );
}
