import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Globe, Zap, CheckCircle2 } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

export default function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative">
          <Link to="/"><Logo /></Link>
        </div>

        <div className="relative space-y-8">
          <h2 className="text-4xl font-bold font-display text-white leading-tight">
            The universal hub for
            <br />
            <span className="text-emerald-400">every currency.</span>
          </h2>
          <p className="text-navy-300 text-lg max-w-md">
            Send, receive, swap, and convert across crypto, forex, and local
            payments — all in one secure dashboard.
          </p>

          <div className="space-y-4">
            <Feature icon={Shield} text="Bank-grade 256-bit encryption" />
            <Feature icon={Zap} text="Instant cross-currency transfers" />
            <Feature icon={Globe} text="190+ countries, 50+ currencies" />
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-navy-400">
          <CheckCircle2 size={16} className="text-emerald-500" />
          Trusted by 2M+ users worldwide
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-navy-50 dark:bg-navy-950">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link to="/"><Logo size="sm" /></Link>
          <ThemeToggle />
        </div>
        <div className="hidden lg:flex justify-end p-6">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold font-display text-navy-900 dark:text-white mb-2">{title}</h1>
            <p className="text-navy-500 dark:text-navy-400 mb-8">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: typeof Shield; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
        <Icon size={20} className="text-emerald-400" />
      </div>
      <span className="text-navy-200">{text}</span>
    </div>
  );
}
