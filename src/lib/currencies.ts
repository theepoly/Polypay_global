import type { Currency } from './types';

export const CURRENCIES: Currency[] = [
  // Crypto
  { code: 'BTC', name: 'Bitcoin', type: 'crypto', symbol: '₿', rate: 67234.5 },
  { code: 'ETH', name: 'Ethereum', type: 'crypto', symbol: 'Ξ', rate: 3245.8 },
  { code: 'USDT', name: 'Tether', type: 'crypto', symbol: '₮', rate: 1.0 },
  { code: 'BNB', name: 'BNB', type: 'crypto', symbol: 'B', rate: 578.3 },
  { code: 'SOL', name: 'Solana', type: 'crypto', symbol: '◎', rate: 152.4 },
  { code: 'XRP', name: 'Ripple', type: 'crypto', symbol: 'X', rate: 0.62 },
  // Forex
  { code: 'USD', name: 'US Dollar', type: 'forex', symbol: '$', rate: 1.0, flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', type: 'forex', symbol: '€', rate: 0.92, flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', type: 'forex', symbol: '£', rate: 0.79, flag: '🇬🇧' },
  { code: 'KES', name: 'Kenyan Shilling', type: 'local', symbol: 'KSh', rate: 129.5, flag: '🇰🇪' },
  { code: 'NGN', name: 'Nigerian Naira', type: 'local', symbol: '₦', rate: 1568.0, flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', type: 'local', symbol: '₵', rate: 15.2, flag: '🇬🇭' },
  { code: 'ZAR', name: 'South African Rand', type: 'local', symbol: 'R', rate: 18.4, flag: '🇿🇦' },
  { code: 'UGX', name: 'Ugandan Shilling', type: 'local', symbol: 'USh', rate: 3745.0, flag: '🇺🇬' },
  // Local payment methods
  { code: 'MPESA', name: 'M-Pesa', type: 'local', symbol: '📱', rate: 129.5, flag: '🇰🇪' },
  { code: 'AIRTEL', name: 'Airtel Money', type: 'local', symbol: '📱', rate: 129.5, flag: '🇰🇪' },
  { code: 'BANK', name: 'Bank Transfer', type: 'local', symbol: '🏦', rate: 1.0 },
  { code: 'PAYPAL', name: 'PayPal', type: 'local', symbol: 'P', rate: 1.0 },
  { code: 'WISE', name: 'Wise', type: 'local', symbol: 'W', rate: 1.0 },
];

export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

export function convert(amount: number, fromCode: string, toCode: string): number {
  const from = getCurrency(fromCode);
  const to = getCurrency(toCode);
  if (!from || !to) return 0;
  const usdAmount = amount / from.rate;
  return usdAmount * to.rate;
}

export function getFee(amount: number, fromCode: string, toCode: string): number {
  const from = getCurrency(fromCode);
  const to = getCurrency(toCode);
  if (!from || !to) return 0;
  if (from.type === 'crypto' && to.type === 'crypto') return amount * 0.001;
  if (from.type === 'forex' && to.type === 'forex') return amount * 0.005;
  return amount * 0.015;
}

export function getCurrencyColor(code: string): string {
  const colors: Record<string, string> = {
    BTC: '#f7931a',
    ETH: '#627eea',
    USDT: '#26a17b',
    BNB: '#f3ba2f',
    SOL: '#9945ff',
    XRP: '#23292f',
    USD: '#22c55e',
    EUR: '#3b82f6',
    GBP: '#a855f7',
    KES: '#10b981',
    NGN: '#ef4444',
    GHS: '#f59e0b',
    ZAR: '#06b6d4',
    UGX: '#eab308',
    MPESA: '#16a34a',
    AIRTEL: '#dc2626',
    BANK: '#3b82f6',
    PAYPAL: '#00457c',
    WISE: '#9fe870',
  };
  return colors[code] || '#64748b';
}
