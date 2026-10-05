import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Bell, Menu, Search, ChevronDown, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 glass border-b border-navy-200/50 dark:border-navy-800/50">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800">
            <Menu size={22} className="text-navy-600 dark:text-navy-300" />
          </button>
          <div className="relative hidden md:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Search transactions, currencies..."
              className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-navy-100 dark:bg-navy-800/50 border border-transparent focus:border-emerald-500/50 focus:outline-none text-sm text-navy-900 dark:text-navy-100 placeholder-navy-400 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <button className="relative p-2.5 rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800 transition-all">
            <Bell size={20} className="text-navy-600 dark:text-navy-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-navy-900 dark:text-white max-w-[120px] truncate">
                  {profile?.full_name || 'User'}
                </span>
                <span className="text-xs text-navy-400">
                  {profile?.kyc_status === 'verified' ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <ChevronDown size={16} className="text-navy-400 hidden sm:block" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl py-2 animate-slide-down">
                <div className="px-4 py-2 border-b border-navy-200 dark:border-navy-800">
                  <p className="text-sm font-medium text-navy-900 dark:text-white truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-navy-400 truncate">{user?.email}</p>
                </div>
                <MenuItem to="/settings" icon={User} label="Profile" onClick={() => setMenuOpen(false)} />
                <MenuItem to="/settings" icon={SettingsIcon} label="Security Settings" onClick={() => setMenuOpen(false)} />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: typeof User;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors">
      <Icon size={18} />
      {label}
    </Link>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
