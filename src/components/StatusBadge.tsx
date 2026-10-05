import { Clock, Loader, CheckCircle, XCircle } from 'lucide-react';
import type { TransactionStatus } from '@/lib/types';

const config: Record<TransactionStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', icon: Loader },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400', icon: XCircle },
};

export default function StatusBadge({ status }: { status: TransactionStatus }) {
  const c = config[status];
  const Icon = c.icon;
  return (
    <span className={`status-badge ${c.color}`}>
      <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
      {c.label}
    </span>
  );
}
