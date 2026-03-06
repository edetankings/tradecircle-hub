import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!);
    const { data: { user }, error: userError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email: myfxEmail, password: myfxPassword, accountId } = await req.json();

    if (!myfxEmail || !myfxPassword || !accountId) {
      return new Response(
        JSON.stringify({ error: "Email, password, and account ID are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Login to Myfxbook API
    const loginUrl = `https://www.myfxbook.com/api/login.json?email=${encodeURIComponent(myfxEmail)}&password=${encodeURIComponent(myfxPassword)}`;
    const loginRes = await fetch(loginUrl);
    const loginData = await loginRes.json();

    if (loginData.error || !loginData.session) {
      return new Response(
        JSON.stringify({
          error: "Invalid Myfxbook credentials or no trades found. Please check your login and account ID.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const session = loginData.session;

    // Step 2: Fetch trade history
    const historyUrl = `https://www.myfxbook.com/api/get-history.json?session=${session}&id=${encodeURIComponent(accountId)}`;
    const historyRes = await fetch(historyUrl);
    const historyData = await historyRes.json();

    if (historyData.error || !historyData.history || historyData.history.length === 0) {
      // Logout
      await fetch(`https://www.myfxbook.com/api/logout.json?session=${session}`);
      return new Response(
        JSON.stringify({
          error: "Invalid Myfxbook credentials or no trades found. Please check your login and account ID.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Map trades to our schema and upsert
    const trades = historyData.history.map((t: any) => ({
      user_id: user.id,
      pair: t.symbol || "UNKNOWN",
      type: t.action === 0 ? "Buy" : "Sell",
      entry_price: parseFloat(t.openPrice) || 0,
      exit_price: parseFloat(t.closePrice) || 0,
      stop_loss: parseFloat(t.sl) || 0,
      take_profit: parseFloat(t.tp) || 0,
      lot_size: parseFloat(t.sizing?.value) || parseFloat(t.lots) || 0,
      profit_loss: parseFloat(t.profit) || 0,
      date: t.closeTime
        ? new Date(t.closeTime).toISOString().split("T")[0]
        : new Date(t.openTime).toISOString().split("T")[0],
      strategy: "",
      notes: "",
      source: "myfxbook",
    }));

    // Delete old myfxbook trades for this user then insert new ones
    await supabase.from("trades").delete().eq("user_id", user.id).eq("source", "myfxbook");

    const { error: insertError } = await supabase.from("trades").insert(trades);
    if (insertError) {
      console.error("Insert error:", insertError);
      await fetch(`https://www.myfxbook.com/api/logout.json?session=${session}`);
      return new Response(
        JSON.stringify({ error: "Failed to save trades to database." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update profile
    await supabase
      .from("profiles")
      .update({
        myfxbook_username: myfxEmail,
        myfxbook_account_id: accountId,
        myfxbook_connected: true,
        last_synced_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    // Logout from Myfxbook
    await fetch(`https://www.myfxbook.com/api/logout.json?session=${session}`);

    return new Response(
      JSON.stringify({
        success: true,
        tradesCount: trades.length,
        lastSynced: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Myfxbook sync error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
