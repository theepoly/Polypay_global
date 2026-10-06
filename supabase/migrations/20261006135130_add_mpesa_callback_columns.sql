/*
# Add M-Pesa callback columns to transactions

1. Modified Tables
- `transactions`: Added `checkout_request_id` (text) to link STK push requests to callback results.
- `transactions`: Added `mpesa_receipt` (text) to store the M-Pesa receipt number from successful callbacks.

2. Security
- No RLS policy changes. Existing owner-scoped policies still apply.

3. Important Notes
- `checkout_request_id` is used by the mpesa-callback edge function to find and update the transaction when Safaricom sends the STK push result.
- `mpesa_receipt` stores the MpesaReceiptNumber from the callback metadata on successful payments.
- Both columns are nullable since they only apply to M-Pesa transactions.
*/

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS checkout_request_id text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS mpesa_receipt text;

CREATE INDEX IF NOT EXISTS idx_transactions_checkout_request_id ON transactions(checkout_request_id);
