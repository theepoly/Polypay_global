import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Wallet, Transaction } from '@/lib/types';
import { CURRENCIES, getCurrency } from '@/lib/currencies';

const DEFAULT_WALLETS = [
  { currency_code: 'USD', currency_name: 'US Dollar', currency_type: 'forex', balance: 0, display_order: 0 },
  { currency_code: 'EUR', currency_name: 'Euro', currency_type: 'forex', balance: 0, display_order: 1 },
  { currency_code: 'GBP', currency_name: 'British Pound', currency_type: 'forex', balance: 0, display_order: 2 },
  { currency_code: 'BTC', currency_name: 'Bitcoin', currency_type: 'crypto', balance: 0, display_order: 3 },
  { currency_code: 'ETH', currency_name: 'Ethereum', currency_type: 'crypto', balance: 0, display_order: 4 },
  { currency_code: 'USDT', currency_name: 'Tether', currency_type: 'crypto', balance: 0, display_order: 5 },
  { currency_code: 'BNB', currency_name: 'BNB', currency_type: 'crypto', balance: 0, display_order: 6 },
  { currency_code: 'SOL', currency_name: 'Solana', currency_type: 'crypto', balance: 0, display_order: 7 },
  { currency_code: 'KES', currency_name: 'Kenyan Shilling', currency_type: 'local', balance: 0, display_order: 8 },
  { currency_code: 'NGN', currency_name: 'Nigerian Naira', currency_type: 'local', balance: 0, display_order: 9 },
  { currency_code: 'GHS', currency_name: 'Ghanaian Cedi', currency_type: 'local', balance: 0, display_order: 10 },
  { currency_code: 'ZAR', currency_name: 'South African Rand', currency_type: 'local', balance: 0, display_order: 11 },
  { currency_code: 'UGX', currency_name: 'Ugandan Shilling', currency_type: 'local', balance: 0, display_order: 12 },
];

export function useUserData() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const seedData = useCallback(async (userId: string) => {
    const { data: existingWallets } = await supabase.from('wallets').select('*').eq('user_id', userId);
    if (!existingWallets || existingWallets.length === 0) {
      const walletInserts = DEFAULT_WALLETS.map((w) => ({ ...w, user_id: userId }));
      await supabase.from('wallets').insert(walletInserts);
    }
  }, []);

  const fetchData = useCallback(async (userId: string) => {
    const [walletRes, txRes] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', userId).order('display_order'),
      supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);
    setWallets((walletRes.data as Wallet[]) || []);
    setTransactions((txRes.data as Transaction[]) || []);
  }, []);

  useEffect(() => {
    if (!user) {
      setWallets([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      await seedData(user.id);
      await fetchData(user.id);
      setLoading(false);
    })();
  }, [user, seedData, fetchData]);

  const refresh = useCallback(async () => {
    if (user) await fetchData(user.id);
  }, [user, fetchData]);

  return { wallets, transactions, loading, refresh };
}

export function getTotalBalanceUSD(wallets: Wallet[]): number {
  return wallets.reduce((total, w) => {
    const cur = getCurrency(w.currency_code);
    if (!cur) return total;
    return total + (w.balance / cur.rate);
  }, 0);
}

export function getWalletBreakdown(wallets: Wallet[]): { crypto: number; forex: number; local: number } {
  return wallets.reduce(
    (acc, w) => {
      const cur = getCurrency(w.currency_code);
      if (!cur) return acc;
      const usdValue = w.balance / cur.rate;
      if (w.currency_type === 'crypto') acc.crypto += usdValue;
      else if (w.currency_type === 'forex') acc.forex += usdValue;
      else acc.local += usdValue;
      return acc;
    },
    { crypto: 0, forex: 0, local: 0 }
  );
}

export function getDistributionData(wallets: Wallet[]): { name: string; value: number; code: string }[] {
  return wallets
    .map((w) => {
      const cur = getCurrency(w.currency_code);
      if (!cur) return null;
      const usdValue = w.balance / cur.rate;
      return { name: w.currency_code, value: Math.round(usdValue), code: w.currency_code };
    })
    .filter((d): d is { name: string; value: number; code: string } => d !== null && d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export { CURRENCIES };
