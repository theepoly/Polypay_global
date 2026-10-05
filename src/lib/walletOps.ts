import { supabase } from '@/lib/supabase';
import { convert, getFee, getCurrency } from '@/lib/currencies';

type WalletRow = { id: string; balance: number };

async function getWallet(userId: string, currencyCode: string): Promise<WalletRow | null> {
  const { data } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('user_id', userId)
    .eq('currency_code', currencyCode)
    .maybeSingle();
  return (data as WalletRow) ?? null;
}

async function updateBalance(walletId: string, newBalance: number): Promise<void> {
  await supabase.from('wallets').update({ balance: newBalance }).eq('id', walletId);
}

export type SendParams = {
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  recipientName: string;
  recipientDetail: string;
  note: string;
};

export type SendResult =
  | { success: true; convertedAmount: number; fee: number }
  | { success: false; error: string };

export async function executeSend(params: SendParams): Promise<SendResult> {
  const { userId, fromCurrency, toCurrency, amount, recipientName, recipientDetail, note } = params;
  const fee = getFee(amount, fromCurrency, toCurrency);
  const totalDeduct = amount + fee;
  const convertedAmount = convert(amount, fromCurrency, toCurrency);

  const fromWallet = await getWallet(userId, fromCurrency);
  if (!fromWallet) {
    return { success: false, error: `You don't have a ${fromCurrency} wallet` };
  }
  if (fromWallet.balance < totalDeduct) {
    return { success: false, error: `Insufficient ${fromCurrency} balance. You have ${formatBalance(fromWallet.balance, fromCurrency)}` };
  }

  // Money leaves your account — it goes to the recipient, not back to your wallet
  await updateBalance(fromWallet.id, fromWallet.balance - totalDeduct);

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'send',
    from_currency: fromCurrency,
    to_currency: toCurrency,
    amount,
    fee,
    exchange_rate: getCurrency(toCurrency)?.rate ?? null,
    status: 'completed',
    recipient_name: recipientName,
    recipient_detail: recipientDetail,
    note,
  });

  return { success: true, convertedAmount, fee };
}

export type SwapParams = {
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
};

export type SwapResult =
  | { success: true; convertedAmount: number; fee: number }
  | { success: false; error: string };

export async function executeSwap(params: SwapParams): Promise<SwapResult> {
  const { userId, fromCurrency, toCurrency, amount } = params;
  const fee = getFee(amount, fromCurrency, toCurrency);
  const totalDeduct = amount + fee;
  const convertedAmount = convert(amount, fromCurrency, toCurrency);

  const fromWallet = await getWallet(userId, fromCurrency);
  if (!fromWallet) {
    return { success: false, error: `You don't have a ${fromCurrency} wallet` };
  }
  if (fromWallet.balance < totalDeduct) {
    return { success: false, error: `Insufficient ${fromCurrency} balance. You have ${formatBalance(fromWallet.balance, fromCurrency)}` };
  }

  // Swap: deduct from source, add converted amount to target (stays in your account)
  await updateBalance(fromWallet.id, fromWallet.balance - totalDeduct);

  const toWallet = await getWallet(userId, toCurrency);
  if (toWallet) {
    await updateBalance(toWallet.id, toWallet.balance + convertedAmount);
  }

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'swap',
    from_currency: fromCurrency,
    to_currency: toCurrency,
    amount,
    fee,
    exchange_rate: getCurrency(toCurrency)?.rate ?? null,
    status: 'completed',
    note: `${fromCurrency} → ${toCurrency} swap`,
  });

  return { success: true, convertedAmount, fee };
}

export type MpesaParams = {
  userId: string;
  mode: 'deposit' | 'withdraw';
  phone: string;
  amount: number;
};

export type MpesaResult =
  | { success: true; netAmount: number; fee: number }
  | { success: false; error: string };

export async function executeMpesa(params: MpesaParams): Promise<MpesaResult> {
  const { userId, mode, phone, amount } = params;
  const fee = mode === 'withdraw' ? amount * 0.01 : 0;
  const netAmount = amount - fee;

  const kesWallet = await getWallet(userId, 'KES');
  if (!kesWallet) {
    return { success: false, error: 'KES wallet not found' };
  }

  if (mode === 'deposit') {
    // Money comes in from M-Pesa to your KES wallet
    await updateBalance(kesWallet.id, kesWallet.balance + amount);
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'deposit',
      from_currency: 'MPESA',
      to_currency: 'KES',
      amount,
      fee: 0,
      exchange_rate: getCurrency('KES')?.rate ?? null,
      status: 'completed',
      recipient_detail: phone,
      note: 'M-Pesa deposit',
    });
  } else {
    // Money leaves your KES wallet and goes out to M-Pesa
    if (kesWallet.balance < amount) {
      return { success: false, error: `Insufficient KES balance. You have ${formatBalance(kesWallet.balance, 'KES')}` };
    }
    await updateBalance(kesWallet.id, kesWallet.balance - amount);
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'withdraw',
      from_currency: 'KES',
      to_currency: 'MPESA',
      amount,
      fee,
      exchange_rate: getCurrency('KES')?.rate ?? null,
      status: 'completed',
      recipient_detail: phone,
      note: 'M-Pesa withdrawal',
    });
  }

  return { success: true, netAmount, fee };
}

export type BankParams = {
  userId: string;
  mode: 'deposit' | 'withdraw';
  accountName: string;
  accountNumber: string;
  bankName: string;
  amount: number;
};

export type BankResult =
  | { success: true; netAmount: number; fee: number }
  | { success: false; error: string };

export async function executeBank(params: BankParams): Promise<BankResult> {
  const { userId, mode, accountName, accountNumber, bankName, amount } = params;
  const fee = mode === 'withdraw' ? amount * 0.008 : 0;
  const netAmount = amount - fee;

  const usdWallet = await getWallet(userId, 'USD');
  if (!usdWallet) {
    return { success: false, error: 'USD wallet not found' };
  }

  const detail = `${bankName} — ${accountNumber}`;

  if (mode === 'deposit') {
    // Money comes in from your bank to your USD wallet
    await updateBalance(usdWallet.id, usdWallet.balance + amount);
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'deposit',
      from_currency: 'BANK',
      to_currency: 'USD',
      amount,
      fee: 0,
      exchange_rate: 1,
      status: 'completed',
      recipient_name: accountName,
      recipient_detail: detail,
      note: `Bank deposit from ${bankName}`,
    });
  } else {
    // Money leaves your USD wallet and goes out to your bank
    if (usdWallet.balance < amount) {
      return { success: false, error: `Insufficient USD balance. You have ${formatBalance(usdWallet.balance, 'USD')}` };
    }
    await updateBalance(usdWallet.id, usdWallet.balance - amount);
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'withdraw',
      from_currency: 'USD',
      to_currency: 'BANK',
      amount,
      fee,
      exchange_rate: 1,
      status: 'completed',
      recipient_name: accountName,
      recipient_detail: detail,
      note: `Bank withdrawal to ${bankName}`,
    });
  }

  return { success: true, netAmount, fee };
}

function formatBalance(balance: number, currency: string): string {
  if (balance < 0.01 && balance > 0) return balance.toFixed(6);
  return balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
