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
    const body = await req.json();
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return new Response(
        JSON.stringify({ error: "Invalid callback body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;
    const checkoutRequestID = callback.CheckoutRequestID;
    const merchantRequestID = callback.MerchantRequestID;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (resultCode === 0) {
      // Transaction succeeded — extract amount from metadata
      const items = callback.CallbackMetadata?.Item || [];
      const amount = items.find((i: any) => i.Name === "Amount")?.Value || 0;
      const mpesaReceipt = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value || "";
      const phone = items.find((i: any) => i.Name === "PhoneNumber")?.Value || "";

      // Record the successful transaction in the database
      const res = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          type: "deposit",
          from_currency: "MPESA",
          to_currency: "KES",
          amount: amount,
          fee: 0,
          exchange_rate: 129.5,
          status: "completed",
          recipient_detail: String(phone),
          note: `M-Pesa STK deposit — Receipt: ${mpesaReceipt}`,
        }),
      });

      if (!res.ok) {
        console.error("Failed to record transaction:", await res.text());
      }

      // Also update wallet balance
      // Find the user by phone and add to their KES wallet
      // This would require linking the callback to a user — in production, use the
      // AccountReference field to store the user ID
    } else {
      // Transaction failed or cancelled
      console.log(`M-Pesa transaction failed: ${resultDesc} (code: ${resultCode})`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        resultCode,
        resultDesc,
        checkoutRequestID,
        merchantRequestID,
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
