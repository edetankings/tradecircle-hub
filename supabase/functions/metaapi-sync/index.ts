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

const PROVISION_URL = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
const RPC_URL = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
};

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userId = user.id;
    const body = await req.json().catch(() => ({}));
    const { mt_account_id } = body as { mt_account_id?: string };

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    let accountQuery = adminClient
      .from("mt_accounts")
      .select("id,broker_name,server_name,account_number,investor_password,platform,last_synced_at")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (mt_account_id) accountQuery = accountQuery.eq("id", mt_account_id);

    const { data: accounts, error: accountError } = await accountQuery;
    if (accountError) throw accountError;

    if (!accounts?.length) {
      return json({ error: "No MT accounts found", total_synced: 0, results: [] });
    }

    let totalSynced = 0;
    const results: Array<Record<string, unknown>> = [];

    for (const account of accounts) {
      try {
        const platformNormalized = String(account.platform || "mt5").toLowerCase();

        const listRes = await fetchWithTimeout(`${PROVISION_URL}/users/current/accounts`, {
          headers: { "auth-token": metaapiToken },
        });

        if (!listRes.ok) {
          const txt = await listRes.text();
          results.push({ account_id: account.id, error: `MetaApi list failed: ${txt}` });
          continue;
        }

        const listPayload = await listRes.json();
        const listedAccounts = Array.isArray(listPayload) ? listPayload : [];

        let metaAccount = listedAccounts.find(
          (a: any) =>
            String(a.login) === String(account.account_number) &&
            String(a.server).toLowerCase() === String(account.server_name).toLowerCase() &&
            String(a.platform || "").toLowerCase() === platformNormalized
        );

        if (!metaAccount) {
          const createRes = await fetchWithTimeout(`${PROVISION_URL}/users/current/accounts`, {
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

          if (!createRes.ok && createRes.status !== 409) {
            const txt = await createRes.text();
            results.push({ account_id: account.id, error: `MetaApi create failed: ${txt}` });
            continue;
          }

          await sleep(500);

          const refreshRes = await fetchWithTimeout(`${PROVISION_URL}/users/current/accounts`, {
            headers: { "auth-token": metaapiToken },
          });
          const refreshPayload = refreshRes.ok ? await refreshRes.json() : [];
          const refreshedAccounts = Array.isArray(refreshPayload) ? refreshPayload : [];

          metaAccount = refreshedAccounts.find(
            (a: any) =>
              String(a.login) === String(account.account_number) &&
              String(a.server).toLowerCase() === String(account.server_name).toLowerCase() &&
              String(a.platform || "").toLowerCase() === platformNormalized
          );
        }

        const metaAccountId = String(metaAccount?._id ?? metaAccount?.id ?? "");
        if (!metaAccountId) {
          results.push({ account_id: account.id, error: "Could not resolve MetaApi account id" });
          continue;
        }

        await fetchWithTimeout(`${PROVISION_URL}/users/current/accounts/${metaAccountId}/deploy`, {
          method: "POST",
          headers: { "auth-token": metaapiToken },
        }).catch(() => null);

        let connected = false;
        let lastState = "";
        let lastConnection = "";

        for (let i = 0; i < 20; i++) {
          const statusRes = await fetchWithTimeout(
            `${PROVISION_URL}/users/current/accounts/${metaAccountId}`,
            { headers: { "auth-token": metaapiToken } },
            10000
          );

          if (statusRes.ok) {
            const statusData = await statusRes.json();
            lastState = String(statusData.state ?? "");
            lastConnection = String(statusData.connectionStatus ?? "");

            const stateReady = ["DEPLOYED", "DEPLOYING"].includes(lastState);
            const connReady = lastConnection.startsWith("CONNECTED");
            if (stateReady && connReady) {
              connected = true;
              break;
            }
          }

          await sleep(1500);
        }

        if (!connected) {
          results.push({
            account_id: account.id,
            error: `Connection timeout (state=${lastState}, status=${lastConnection})`,
          });
          continue;
        }

        const now = new Date();
        const defaultStart = new Date(now);
        defaultStart.setDate(defaultStart.getDate() - 90);

        const fromDate = account.last_synced_at ? new Date(account.last_synced_at) : defaultStart;
        const start = Number.isNaN(fromDate.getTime()) ? defaultStart : fromDate;

        const historyRes = await fetchWithTimeout(
          `${RPC_URL}/users/current/accounts/${metaAccountId}/history-deals/time/${start.toISOString()}/${now.toISOString()}`,
          { headers: { "auth-token": metaapiToken } },
          30000
        );

        if (!historyRes.ok) {
          const txt = await historyRes.text();
          results.push({ account_id: account.id, error: `History fetch failed: ${txt}` });
          continue;
        }

        const historyPayload = await historyRes.json();
        const deals = Array.isArray(historyPayload) ? historyPayload : [];
        const normalizedDeals = deals.filter(
          (deal: any) =>
            (deal.type === "DEAL_TYPE_BUY" || deal.type === "DEAL_TYPE_SELL") &&
            deal?.id &&
            deal?.time &&
            deal?.symbol
        );

        const tickets = normalizedDeals.map((deal: any) => String(deal.id));
        const existingTickets = new Set<string>();

        for (const ticketChunk of chunk(tickets, 200)) {
          if (!ticketChunk.length) continue;

          const { data: existing, error: existingErr } = await adminClient
            .from("trades")
            .select("ticket")
            .eq("user_id", userId)
            .eq("mt_account_id", account.id)
            .eq("source", "metaapi")
            .in("ticket", ticketChunk);

          if (existingErr) throw existingErr;

          for (const row of existing ?? []) {
            if (row.ticket) existingTickets.add(String(row.ticket));
          }
        }

        const toInsert = normalizedDeals
          .filter((deal: any) => !existingTickets.has(String(deal.id)))
          .map((deal: any) => {
            const isoTime = new Date(deal.time).toISOString();
            return {
              user_id: userId,
              mt_account_id: account.id,
              ticket: String(deal.id),
              pair: String(deal.symbol),
              type: deal.type === "DEAL_TYPE_BUY" ? "Buy" : "Sell",
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
            };
          });

        let synced = 0;
        for (const batch of chunk(toInsert, 100)) {
          if (!batch.length) continue;
          const { error: insertError } = await adminClient.from("trades").insert(batch);
          if (insertError) throw insertError;
          synced += batch.length;
          await sleep(150);
        }

        totalSynced += synced;

        await adminClient
          .from("mt_accounts")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("id", account.id);

        results.push({ account_id: account.id, synced, success: true });
      } catch (error: any) {
        results.push({
          account_id: account.id,
          error: error?.message ?? "Unknown sync error",
        });
      }
    }

    return json({ success: true, total_synced: totalSynced, results });
  } catch (error: any) {
    return json({ error: error?.message ?? "Unexpected error" }, 500);
  }
});
