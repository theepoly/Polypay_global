import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  TrendingUp,
  Bitcoin,
  Banknote,
  Smartphone,
  CheckCircle2,
  Star,
} from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { liveTickerData } from '@/lib/mockData';
import { formatNumber } from '@/lib/format';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 glass border-b border-navy-200/50 dark:border-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm hidden sm:block">
                  Log In
                </Link>
                <Link to="/signup" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Live Ticker */}
      <LiveTicker />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-navy-500/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Trusted by 2M+ users worldwide
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-navy-900 dark:text-white leading-tight">
                Send Money
                <br />
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                  Anywhere
                </span>
                {' '}in 3 Clicks
              </h1>

              <p className="mt-6 text-lg text-navy-600 dark:text-navy-300 max-w-lg">
                The universal transfer hub for crypto, forex, and local payments.
                Swap between BTC, USD, M-Pesa, and 50+ currencies instantly with
                zero hidden fees.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2 group">
                  Start Sending Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3.5 text-center">
                  I have an account
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6">
                <TrustBadge icon={Shield} label="Bank-grade security" />
                <TrustBadge icon={Zap} label="Instant transfers" />
                <TrustBadge icon={Globe} label="190+ countries" />
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="glass-card rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-navy-400">Total Balance</p>
                    <p className="text-3xl font-bold text-navy-900 dark:text-white">$28,430.50</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    +12.4%
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <MiniWallet icon={Bitcoin} label="Crypto" amount="$18,240" color="#f7931a" />
                  <MiniWallet icon={Banknote} label="Forex" amount="$7,890" color="#22c55e" />
                  <MiniWallet icon={Smartphone} label="Local" amount="$2,300" color="#3b82f6" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-navy-100 dark:bg-navy-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <ArrowRight size={18} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy-900 dark:text-white">USD → KES (M-Pesa)</p>
                        <p className="text-xs text-navy-400">Completed • 2 min ago</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">KSh 129,500</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-navy-100 dark:bg-navy-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                        <TrendingUp size={18} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy-900 dark:text-white">ETH → USDT</p>
                        <p className="text-xs text-navy-400">Completed • 1 hr ago</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">$3,240.00</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 glass-card rounded-2xl p-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">Fee saved</p>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">$24.50</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-display text-navy-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-4 text-navy-600 dark:text-navy-400 max-w-2xl mx-auto">
              Three simple steps to send money across any currency, anytime, anywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              num="1"
              icon={Globe}
              title="Select Currencies"
              desc="Choose from crypto, forex, or local payment methods. We support 50+ currencies including BTC, USD, EUR, M-Pesa, and more."
            />
            <StepCard
              num="2"
              icon={Zap}
              title="Enter & Convert"
              desc="Type the amount and see live conversion rates with transparent fees. No hidden charges, ever."
            />
            <StepCard
              num="3"
              icon={Shield}
              title="Confirm & Send"
              desc="Enter recipient details and confirm with your PIN or 2FA. Your transfer is secured end-to-end."
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-display text-navy-900 dark:text-white">
              One App, Every Currency
            </h2>
            <p className="mt-4 text-navy-600 dark:text-navy-400">
              Crypto, forex, and local money — all in one beautiful dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Bitcoin} title="Crypto Wallet" desc="BTC, ETH, USDT, BNB, SOL and more. Swap instantly with live rates." color="#f7931a" />
            <FeatureCard icon={Banknote} title="Forex Wallet" desc="Hold and convert USD, EUR, GBP at real-time exchange rates." color="#22c55e" />
            <FeatureCard icon={Smartphone} title="Mobile Money" desc="Send to M-Pesa, Airtel Money, bank accounts, PayPal, and Wise." color="#3b82f6" />
            <FeatureCard icon={TrendingUp} title="Live Markets" desc="Track prices with interactive charts and real-time market data." color="#a855f7" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard value="$4.2B+" label="Total transferred" />
            <StatCard value="2M+" label="Active users" />
            <StatCard value="190+" label="Countries" />
            <StatCard value="50+" label="Currencies" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="relative glass-card rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-navy-500/10" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold font-display text-navy-900 dark:text-white">
                Ready to send money smarter?
              </h2>
              <p className="mt-4 text-navy-600 dark:text-navy-400 max-w-xl mx-auto">
                Join millions who trust PolyPay for fast, secure, and affordable
                transfers across every currency.
              </p>
              <Link
                to="/signup"
                className="btn-primary text-base px-8 py-3.5 mt-8 inline-flex items-center gap-2 group"
              >
                Create Free Account
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-navy-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo size="sm" />
            <p className="text-sm text-navy-400">
              © 2026 PolyPay Global. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-navy-400">
              <Shield size={16} className="text-emerald-500" />
              Secured with 256-bit encryption
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LiveTicker() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((o) => o - 1);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const items = [...liveTickerData, ...liveTickerData, ...liveTickerData];

  return (
    <div className="overflow-hidden bg-navy-900 dark:bg-navy-900/50 py-3 border-b border-navy-800">
      <div className="flex gap-8 whitespace-nowrap" style={{ transform: `translateX(${offset}px)` }}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="font-medium text-navy-300">{item.symbol}</span>
            <span className="text-white font-semibold">{formatNumber(item.price, item.price > 100 ? 2 : 4)}</span>
            <span className={item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {item.change >= 0 ? '+' : ''}{item.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustBadge({ icon: Icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300">
      <Icon size={18} className="text-emerald-500" />
      {label}
    </div>
  );
}

function MiniWallet({ icon: Icon, label, amount, color }: { icon: typeof Bitcoin; label: string; amount: string; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-navy-100 dark:bg-navy-800/50">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${color}20` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <p className="text-xs text-navy-400">{label}</p>
      <p className="text-sm font-bold text-navy-900 dark:text-white">{amount}</p>
    </div>
  );
}

function StepCard({ num, icon: Icon, title, desc }: { num: string; icon: typeof Globe; title: string; desc: string }) {
  return (
    <div className="relative glass-card rounded-2xl p-8 group hover:scale-[1.02] transition-transform duration-300">
      <div className="absolute top-6 right-6 text-5xl font-bold font-display text-navy-100 dark:text-navy-800">
        {num}
      </div>
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
        <Icon size={24} className="text-emerald-500" />
      </div>
      <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-navy-600 dark:text-navy-400">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: typeof Bitcoin; title: string; desc: string; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}20` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-navy-600 dark:text-navy-400">{desc}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl lg:text-4xl font-bold font-display bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
        {value}
      </p>
      <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">{label}</p>
    </div>
  );
}
