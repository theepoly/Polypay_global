import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const iconDim = size === 'sm' ? 18 : size === 'lg' ? 26 : 22;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className={`${dim} rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform`}>
        <Wallet size={iconDim} className="text-white" />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold ${textSize} text-navy-900 dark:text-white`}>
          polypay
        </span>
        <span className="text-[10px] font-medium text-emerald-500 tracking-wider uppercase">
          Global
        </span>
      </div>
    </Link>
  );
}
