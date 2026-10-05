/*
# PolyPay Global - Database Schema

1. New Tables
- `profiles`: Extends auth.users with user display data (full_name, phone, avatar_url, kyc_status, two_factor_enabled, created_at)
- `wallets`: User wallets for each currency they hold. Tracks currency_code, currency_name, currency_type (crypto/forex/local), balance, and display order.
- `transactions`: Full transaction history. Tracks type (send/receive/swap/deposit/withdraw), from_currency, to_currency, amount, fee, status (pending/processing/completed/failed), recipient details, and timestamps.

2. Security
- RLS enabled on all tables.
- Owner-scoped CRUD: each authenticated user can only access rows where user_id matches auth.uid().
- profiles table uses auth.uid() = id (id is the user's auth UUID).

3. Important Notes
- user_id columns default to auth.uid() so frontend inserts that omit user_id still satisfy RLS.
- profiles.id references auth.users(id) with CASCADE delete.
- All tables have created_at/updated_at timestamps.
- Indexes added on user_id and status for query performance.
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  kyc_status text NOT NULL DEFAULT 'unverified',
  two_factor_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- WALLETS TABLE
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_code text NOT NULL,
  currency_name text NOT NULL,
  currency_type text NOT NULL DEFAULT 'forex',
  balance numeric NOT NULL DEFAULT 0,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, currency_code)
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_wallets" ON wallets;
CREATE POLICY "select_own_wallets" ON wallets FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_wallets" ON wallets;
CREATE POLICY "insert_own_wallets" ON wallets FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_wallets" ON wallets;
CREATE POLICY "update_own_wallets" ON wallets FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_wallets" ON wallets;
CREATE POLICY "delete_own_wallets" ON wallets FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  from_currency text,
  to_currency text,
  amount numeric NOT NULL DEFAULT 0,
  fee numeric NOT NULL DEFAULT 0,
  exchange_rate numeric,
  status text NOT NULL DEFAULT 'pending',
  recipient_name text,
  recipient_detail text,
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions" ON transactions FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;
CREATE POLICY "delete_own_transactions" ON transactions FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- HANDLE NEW USER CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
