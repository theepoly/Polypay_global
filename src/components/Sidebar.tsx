import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Receipt,
  TrendingUp,
  Settings,
  X,
} from 'lucide-react';
import Logo from './Logo';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/swap', label: 'Swap / Convert', icon: ArrowLeftRight },
  { to: '/wallets', label: 'Wallets', icon: Wallet },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/rates', label: 'Rates & Markets', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 glass-card border-r border-navy-200/50 dark:border-navy-800/50 rounded-none flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <Logo />
          <button onClick={onClose} className="lg:hidden text-navy-500 hover:text-navy-900 dark:hover:text-white">
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-navy-500/10 border border-emerald-500/20">
          <p className="text-sm font-semibold text-navy-900 dark:text-white">Need help?</p>
          <p className="text-xs text-navy-500 dark:text-navy-400 mt-1 mb-3">
            24/7 support for all transfers
          </p>
          <button className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            Contact Support
          </button>
        </div>
      </aside>
    </>
  );
}
