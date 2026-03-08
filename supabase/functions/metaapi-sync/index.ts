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
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const metaapiToken = Deno.env.get("METAAPI_TOKEN");

    if (!metaapiToken) {
      return new Response(
        JSON.stringify({ error: "MetaApi token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const body = await req.json().catch(() => ({}));
    const { mt_account_id } = body;

    // Use service role to read encrypted passwords
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Get the specific account or all accounts for this user
    let query = adminClient
      .from("mt_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (mt_account_id) {
      query = query.eq("id", mt_account_id);
    }

    const { data: accounts, error: accErr } = await query;
    if (accErr) throw accErr;
    if (!accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No MT accounts found", synced: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const METAAPI_URL = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
    let totalSynced = 0;
    const results: any[] = [];

    for (const account of accounts) {
      try {
        // Step 1: Create a MetaApi account (or find existing)
        // For MetaApi, we need to provision the account first
        const provisionRes = await fetch(`${METAAPI_URL}/users/current/accounts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": metaapiToken,
          },
          body: JSON.stringify({
            name: `${account.broker_name}-${account.account_number}`,
            type: "cloud",
            login: account.account_number,
            password: account.investor_password,
            server: account.server_name,
            platform: account.platform.toLowerCase(),
            magic: 0,
          }),
        });

        let metaAccountId: string;
        if (provisionRes.status === 409) {
          // Account already exists, find it
          const listRes = await fetch(`${METAAPI_URL}/users/current/accounts`, {
            headers: { "auth-token": metaapiToken },
          });
          const allAccounts = await listRes.json();
          const existing = allAccounts.find(
            (a: any) => a.login === account.account_number && a.server === account.server_name
          );
          if (!existing) {
            results.push({ account_id: account.id, error: "Could not find existing MetaApi account" });
            continue;
          }
          metaAccountId = existing._id;
        } else if (!provisionRes.ok) {
          const errBody = await provisionRes.text();
          results.push({ account_id: account.id, error: `Provision failed: ${errBody}` });
          continue;
        } else {
          const provisionData = await provisionRes.json();
          metaAccountId = provisionData.id;
        }

        // Step 2: Deploy and wait for connection
        await fetch(`${METAAPI_URL}/users/current/accounts/${metaAccountId}/deploy`, {
          method: "POST",
          headers: { "auth-token": metaapiToken },
        });

        // Wait for account to connect (poll with timeout)
        let connected = false;
        for (let i = 0; i < 30; i++) {
          const statusRes = await fetch(`${METAAPI_URL}/users/current/accounts/${metaAccountId}`, {
            headers: { "auth-token": metaapiToken },
          });
          const statusData = await statusRes.json();
          if (statusData.connectionStatus === "CONNECTED" && statusData.state === "DEPLOYED") {
            connected = true;
            break;
          }
          await new Promise((r) => setTimeout(r, 2000));
        }

        if (!connected) {
          results.push({ account_id: account.id, error: "Connection timeout" });
          continue;
        }

        // Step 3: Fetch trade history
        const RPC_URL = `https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai`;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3); // Last 3 months

        const historyRes = await fetch(
          `${RPC_URL}/users/current/accounts/${metaAccountId}/history-deals/time/${startDate.toISOString()}/${new Date().toISOString()}`,
          { headers: { "auth-token": metaapiToken } }
        );

        if (!historyRes.ok) {
          const errText = await historyRes.text();
          results.push({ account_id: account.id, error: `History fetch failed: ${errText}` });
          continue;
        }

        const deals = await historyRes.json();
        let synced = 0;

        // Step 4: Insert trades, skip duplicates via ticket
        for (const deal of deals) {
          if (deal.type !== "DEAL_TYPE_BUY" && deal.type !== "DEAL_TYPE_SELL") continue;
          if (!deal.time || !deal.symbol) continue;

          const tradeType = deal.type === "DEAL_TYPE_BUY" ? "BUY" : "SELL";
          const { error: insertErr } = await adminClient.from("trades").insert({
            user_id: userId,
            mt_account_id: account.id,
            ticket: String(deal.id),
            pair: deal.symbol,
            type: tradeType,
            entry_price: deal.price || 0,
            exit_price: deal.price || 0,
            profit_loss: deal.profit || 0,
            lot_size: deal.volume || 0,
            open_time: deal.time,
            close_time: deal.brokerTime || deal.time,
            date: new Date(deal.time).toISOString().split("T")[0],
            stop_loss: 0,
            take_profit: 0,
            source: "metaapi",
          });

          if (!insertErr) synced++;
        }

        totalSynced += synced;

        // Update last_synced_at
        await adminClient
          .from("mt_accounts")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("id", account.id);

        results.push({ account_id: account.id, synced, success: true });
      } catch (err: any) {
        results.push({ account_id: account.id, error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, total_synced: totalSynced, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
