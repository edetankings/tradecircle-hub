import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const metaapiToken = Deno.env.get("METAAPI_TOKEN");

    if (!metaapiToken) {
      return json({ error: "MetaApi token not configured" }, 500);
    }

    // Verify caller
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );

    if (claimsError || !claimsData?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userId = claimsData.claims.sub;
    const body = await req.json().catch(() => ({}));
    const { mt_account_id } = body;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    let query = adminClient
      .from("mt_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (mt_account_id) query = query.eq("id", mt_account_id);

    const { data: accounts, error: accErr } = await query;
    if (accErr) throw accErr;

    if (!accounts || accounts.length === 0) {
      return json({ error: "No MT accounts found", total_synced: 0, results: [] });
    }

    const PROVISION_URL = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
    const RPC_URL = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";

    // Load existing trades once to avoid duplicate inserts
    const accountIds = accounts.map((a) => a.id);
    const { data: existingTrades } = await adminClient
      .from("trades")
      .select("ticket,mt_account_id")
      .eq("user_id", userId)
      .in("mt_account_id", accountIds)
      .eq("source", "metaapi");

    const existingKeySet = new Set(
      (existingTrades ?? []).map((t) => `${t.mt_account_id}|${String(t.ticket ?? "")}`)
    );

    let totalSynced = 0;
    const results: Array<Record<string, unknown>> = [];

    // Fetch account list once and reuse for matching
    const listRes = await fetch(`${PROVISION_URL}/users/current/accounts`, {
      headers: { "auth-token": metaapiToken },
    });

    const allMetaAccounts = listRes.ok ? await listRes.json() : [];

    for (const account of accounts) {
      try {
        const platformNormalized = String(account.platform || "mt5").toLowerCase();

        // 1) Resolve or create MetaApi account
        let existing = (Array.isArray(allMetaAccounts) ? allMetaAccounts : []).find(
          (a: any) =>
            String(a.login) === String(account.account_number) &&
            String(a.server).toLowerCase() === String(account.server_name).toLowerCase() &&
            String(a.platform || "").toLowerCase() === platformNormalized
        );

        if (!existing) {
          const provisionRes = await fetch(`${PROVISION_URL}/users/current/accounts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": metaapiToken,
            },
            body: JSON.stringify({
              name: `${account.broker_name}-${account.account_number}`,
              type: "cloud",
              login: String(account.account_number),
              password: account.investor_password,
              server: account.server_name,
              platform: platformNormalized,
              magic: 0,
            }),
          });

          if (!provisionRes.ok && provisionRes.status !== 409) {
            const errBody = await provisionRes.text();
            results.push({
              account_id: account.id,
              error: `Provision failed (${provisionRes.status}): ${errBody}`,
            });
            continue;
          }

          // Reload account list to resolve id reliably (_id/id)
          const refetchRes = await fetch(`${PROVISION_URL}/users/current/accounts`, {
            headers: { "auth-token": metaapiToken },
          });
          const refreshed = refetchRes.ok ? await refetchRes.json() : [];

          existing = (Array.isArray(refreshed) ? refreshed : []).find(
            (a: any) =>
              String(a.login) === String(account.account_number) &&
              String(a.server).toLowerCase() === String(account.server_name).toLowerCase() &&
              String(a.platform || "").toLowerCase() === platformNormalized
          );
        }

        const metaAccountId = String(existing?._id ?? existing?.id ?? "");
        if (!metaAccountId) {
          results.push({ account_id: account.id, error: "Could not resolve MetaApi account id" });
          continue;
        }

        // 2) Deploy (idempotent)
        await fetch(`${PROVISION_URL}/users/current/accounts/${metaAccountId}/deploy`, {
          method: "POST",
          headers: { "auth-token": metaapiToken },
        });

        // 3) Wait for connection with relaxed status checks
        let connected = false;
        let lastState = "";
        let lastConnection = "";

        for (let i = 0; i < 45; i++) {
          const statusRes = await fetch(`${PROVISION_URL}/users/current/accounts/${metaAccountId}`, {
            headers: { "auth-token": metaapiToken },
          });

          if (statusRes.ok) {
            const statusData = await statusRes.json();
            lastState = String(statusData.state ?? "");
            lastConnection = String(statusData.connectionStatus ?? "");

            const stateOk = ["DEPLOYED", "DEPLOYING"].includes(lastState);
            const connectionOk = lastConnection.startsWith("CONNECTED");

            if (stateOk && connectionOk) {
              connected = true;
              break;
            }
          }

          await new Promise((r) => setTimeout(r, 2000));
        }

        if (!connected) {
          results.push({
            account_id: account.id,
            error: `Connection timeout (state=${lastState}, status=${lastConnection})`,
          });
          continue;
        }

        // 4) Fetch history deals (last 6 months)
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

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
        const dealList = Array.isArray(deals) ? deals : [];
        let synced = 0;

        for (const deal of dealList) {
          // deal types for closing PnL records are usually BUY/SELL entries in history deals
          if (deal.type !== "DEAL_TYPE_BUY" && deal.type !== "DEAL_TYPE_SELL") continue;
          if (!deal.time || !deal.symbol || !deal.id) continue;

          const ticket = String(deal.id);
          const dedupeKey = `${account.id}|${ticket}`;
          if (existingKeySet.has(dedupeKey)) continue;

          const tradeType = deal.type === "DEAL_TYPE_BUY" ? "Buy" : "Sell";
          const isoTime = new Date(deal.time).toISOString();

          const { error: insertErr } = await adminClient.from("trades").insert({
            user_id: userId,
            mt_account_id: account.id,
            ticket,
            pair: String(deal.symbol),
            type: tradeType,
            entry_price: Number(deal.price ?? 0),
            exit_price: Number(deal.price ?? 0),
            profit_loss: Number(deal.profit ?? 0),
            lot_size: Number(deal.volume ?? 0),
            open_time: isoTime,
            close_time: isoTime,
            date: isoTime.split("T")[0],
            stop_loss: Number(deal.stopLoss ?? 0),
            take_profit: Number(deal.takeProfit ?? 0),
            source: "metaapi",
          });

          if (!insertErr) {
            existingKeySet.add(dedupeKey);
            synced++;
          }
        }

        totalSynced += synced;

        await adminClient
          .from("mt_accounts")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("id", account.id);

        results.push({ account_id: account.id, synced, success: true });
      } catch (err: any) {
        results.push({ account_id: account.id, error: err.message ?? "Unknown sync error" });
      }
    }

    return json({ success: true, total_synced: totalSynced, results });
  } catch (err: any) {
    return json({ error: err.message ?? "Unexpected error" }, 500);
  }
});
