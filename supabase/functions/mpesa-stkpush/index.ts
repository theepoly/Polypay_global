Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const {
      phone,
      amount,
      mode,
      userId,
      accountName,
      accountNumber,
      bankName,
    } = await req.json();

    if (!phone || !amount || amount < 1) {
      return new Response(
        JSON.stringify({ error: "Phone and amount (min 1) are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const passkey = Deno.env.get("MPESA_PASSKEY");
    const shortcode = Deno.env.get("MPESA_SHORTCODE") || "174379";

    if (!consumerKey || !consumerSecret || !passkey) {
      return new Response(
        JSON.stringify({
          error: "M-Pesa API credentials are not configured. Please set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, and MPESA_SHORTCODE in Supabase Edge Function secrets.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Get OAuth access token from Safaricom
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!tokenRes.ok) {
      const tokenErr = await tokenRes.text();
      return new Response(
        JSON.stringify({ error: `Failed to authenticate with M-Pesa: ${tokenErr}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Step 2: Build STK Push request
    const timestamp = getTimestamp();
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Normalize phone to Safaricom format (2547XXXXXXXX)
    const normalizedPhone = normalizePhone(phone);

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: normalizedPhone,
      PartyB: shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-callback`,
      AccountReference: mode === "withdraw" ? `Withdraw-${accountNumber || "N/A"}` : "PolyPayDeposit",
      TransactionDesc: mode === "withdraw"
        ? `Withdrawal to ${accountName || phone}`
        : `Deposit for user ${userId}`,
    };

    // Step 3: Send STK Push to Safaricom
    const stkRes = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      }
    );

    const stkData = await stkRes.json();

    if (!stkRes.ok) {
      return new Response(
        JSON.stringify({
          error: stkData.errorMessage || stkData.error || "M-Pesa STK Push failed",
          details: stkData,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // STK Push sent successfully — the user will get a prompt on their phone
    return new Response(
      JSON.stringify({
        success: true,
        checkoutRequestID: stkData.CheckoutRequestID,
        merchantRequestID: stkData.MerchantRequestID,
        message: "STK Push sent. Check your phone to complete the transaction.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-+]/g, "");
  if (p.startsWith("254")) return p;
  if (p.startsWith("0")) return "254" + p.slice(1);
  if (p.startsWith("7") || p.startsWith("1")) return "254" + p;
  return p;
}
