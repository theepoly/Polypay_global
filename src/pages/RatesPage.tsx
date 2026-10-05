import { useState } from 'react';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { PageHeader } from '@/components/Topbar';
import CurrencyIcon from '@/components/CurrencyIcon';
import { ratesPageData } from '@/lib/mockData';
import { formatNumber } from '@/lib/format';
import { getCurrencyColor } from '@/lib/currencies';

type FilterType = 'all' | 'crypto' | 'forex' | 'local';

export default function RatesPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = ratesPageData.filter((r) => {
    if (filter !== 'all' && r.type !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return r.name.toLowerCase().includes(s) || r.code.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div>
      <PageHeader title="Rates & Markets" subtitle="Live prices for crypto, forex, and local currencies." />

      {/* Market Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MarketSummaryCard label="Crypto Market Cap" value="$2.31T" change="+2.4%" positive />
        <MarketSummaryCard label="Forex Volume" value="$7.5T" change="+0.3%" positive />
        <MarketSummaryCard label="Active Pairs" value="50+" change="Live" />
        <MarketSummaryCard label="Best Rate" label2="USD/KES" value="129.50" change="+0.03%" positive />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currencies..."
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'crypto', 'forex', 'local'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-navy-500 hover:bg-navy-100 dark:hover:bg-navy-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Rates Table */}
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-200 dark:border-navy-800 text-left">
              <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider">#</th>
              <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Currency</th>
              <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Price (USD)</th>
              <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider">24h Change</th>
              <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider hidden md:table-cell">Volume</th>
              <th className="pb-3 text-xs font-medium text-navy-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rate, i) => (
              <tr key={rate.code} className="border-b border-navy-100 dark:border-navy-800/50 hover:bg-navy-50 dark:hover:bg-navy-800/30 transition-colors">
                <td className="py-4 text-sm text-navy-400">{i + 1}</td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <CurrencyIcon code={rate.code} size={36} />
                    <div>
                      <p className="text-sm font-bold text-navy-900 dark:text-white">{rate.code}</p>
                      <p className="text-xs text-navy-400">{rate.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-sm font-bold text-navy-900 dark:text-white">
                    ${formatNumber(rate.price, rate.price > 100 ? 2 : 4)}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`text-sm font-medium flex items-center gap-1 ${rate.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {rate.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {rate.change >= 0 ? '+' : ''}{rate.change}%
                  </span>
                </td>
                <td className="py-4 hidden md:table-cell">
                  <span className="text-sm text-navy-500">{rate.volume}</span>
                </td>
                <td className="py-4 hidden sm:table-cell">
                  <span className="text-xs font-medium capitalize px-2.5 py-1 rounded-full bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300">
                    {rate.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarketSummaryCard({ label, label2, value, change, positive }: { label: string; label2?: string; value: string; change: string; positive?: boolean }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs text-navy-400 mb-1">{label}</p>
      {label2 && <p className="text-xs text-navy-400 mb-0.5">{label2}</p>}
      <p className="text-xl font-bold text-navy-900 dark:text-white">{value}</p>
      <p className={`text-xs font-medium mt-1 ${positive ? 'text-emerald-500' : 'text-navy-400'}`}>{change}</p>
    </div>
  );
}
