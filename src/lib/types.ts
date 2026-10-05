export type CurrencyType = 'crypto' | 'forex' | 'local';

export type Currency = {
  code: string;
  name: string;
  type: CurrencyType;
  symbol: string;
  rate: number;
  flag?: string;
  logo?: string;
};

export type Wallet = {
  id: string;
  currency_code: string;
  currency_name: string;
  currency_type: CurrencyType;
  balance: number;
};

export type TransactionType = 'send' | 'receive' | 'swap' | 'deposit' | 'withdraw';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  from_currency: string | null;
  to_currency: string | null;
  amount: number;
  fee: number;
  exchange_rate: number | null;
  status: TransactionStatus;
  recipient_name: string | null;
  recipient_detail: string | null;
  note: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  kyc_status: string;
  two_factor_enabled: boolean;
};
