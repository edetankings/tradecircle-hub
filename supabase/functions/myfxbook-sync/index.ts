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

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toIsoOrNull = (value: unknown): string | null => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const toTradeType = (value: unknown): "Buy" | "Sell" => {
  if (typeof value === "number") return value === 0 ? "Buy" : "Sell";
  const normalized = String(value ?? "").toLowerCase();
  if (["0", "buy", "long"].includes(normalized)) return "Buy";
  return "Sell";
};

const getAccountId = (account: any): string =>
  String(account?.id ?? account?.accountId ?? account?.account_id ?? account?.accountid ?? "").trim();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
};

async function fetchJsonWithRetry(url: URL, retries = 3) {
  let lastError = "External API request failed";

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url.toString());

    if (response.ok) {
      return await response.json();
    }

    const retryAfter = Number(response.headers.get("retry-after") ?? 0);
    const bodyText = await response.text();
    lastError = bodyText || `HTTP ${response.status}`;

    if (attempt < retries && (response.status === 429 || response.status >= 500)) {
      const waitMs = retryAfter > 0 ? retryAfter * 1000 : 400 + attempt * 400;
      await sleep(waitMs);
      continue;
    }

    throw new Error(lastError);
  }

  throw new Error(lastError);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let myfxSession: string | null = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const anonClient = createClient(supabaseUrl, anonKey);

    const {
      data: { user },
      error: userError,
    } = await anonClient.auth.getUser(token);

    if (userError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "").trim();
    const requestedAccountId = String(body?.accountId ?? "").trim();

    if (!email || !password) {
      return json({ error: "Email and password are required." }, 400);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("last_synced_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const lastSyncedAt = profile?.last_synced_at ? new Date(profile.last_synced_at) : null;

    // 1) Login
    const loginUrl = new URL("https://www.myfxbook.com/api/login.json");
    loginUrl.searchParams.set("email", email);
    loginUrl.searchParams.set("password", password);

    const loginData = await fetchJsonWithRetry(loginUrl, 2);
    if (loginData?.error || !loginData?.session) {
      return json(
        {
          error:
            String(loginData?.message || loginData?.error || "").trim() ||
            "Myfxbook login failed. Please check your email and password.",
        },
        400
      );
    }

    myfxSession = String(loginData.session);

    // 2) Fetch accounts
    const accountsUrl = new URL("https://www.myfxbook.com/api/get-my-accounts.json");
    accountsUrl.searchParams.set("session", myfxSession);

    const accountsData = await fetchJsonWithRetry(accountsUrl, 2);
    const accounts = Array.isArray(accountsData?.accounts) ? accountsData.accounts : [];

    if (accountsData?.error || accounts.length === 0) {
      return json(
        {
          error:
            String(accountsData?.message || accountsData?.error || "").trim() ||
            "Myfxbook account found but no trading accounts are connected.",
        },
        400
      );
    }

    const selectedAccount = requestedAccountId
      ? accounts.find((acc: any) => getAccountId(acc) === requestedAccountId)
      : accounts[0];

    if (!selectedAccount) {
      return json({ error: "Invalid account ID. Please check and try again." }, 400);
    }

    const selectedAccountId = getAccountId(selectedAccount);
    if (!selectedAccountId) {
      return json({ error: "Invalid account ID. Please check and try again." }, 400);
    }

    // 3) Fetch trade history
    const historyUrl = new URL("https://www.myfxbook.com/api/get-history.json");
    historyUrl.searchParams.set("session", myfxSession);
    historyUrl.searchParams.set("id", selectedAccountId);

    const historyData = await fetchJsonWithRetry(historyUrl, 2);
    if (historyData?.error) {
      return json(
        {
          error:
            String(historyData?.message || historyData?.error || "").trim() ||
            "Unable to fetch Myfxbook trade history.",
        },
        400
      );
    }

    const history = Array.isArray(historyData?.history) ? historyData.history : [];

    const mappedTrades = history
      .map((trade: any) => {
        const openTime = toIsoOrNull(trade.openTime ?? trade.open_time ?? trade.openDate);
        const closeTime = toIsoOrNull(trade.closeTime ?? trade.close_time ?? trade.closeDate);
        const pair = String(trade.symbol ?? trade.pair ?? "").trim();

        if (!pair) return null;
        if (!openTime && !closeTime) return null;

        const myfxbookTradeId = String(trade.tradeId ?? trade.ticket ?? trade.order ?? trade.id ?? "").trim();
        const dateIso = closeTime ?? openTime;
        if (!dateIso) return null;

        const tradeDate = new Date(dateIso);
        if (lastSyncedAt && !Number.isNaN(tradeDate.getTime()) && tradeDate <= lastSyncedAt) {
          return null;
        }

        return {
          user_id: user.id,
          pair,
          type: toTradeType(trade.action ?? trade.type ?? trade.cmd),
          entry_price: toNumber(trade.openPrice ?? trade.entry_price),
          exit_price: toNumber(trade.closePrice ?? trade.exit_price),
          stop_loss: toNumber(trade.sl),
          take_profit: toNumber(trade.tp),
          lot_size: toNumber(trade.lots ?? trade.volume ?? trade.size),
          profit_loss: toNumber(trade.profit),
          date: dateIso.split("T")[0],
          strategy: "",
          notes: "",
          source: "myfxbook",
          myfxbook_trade_id: myfxbookTradeId || null,
          open_time: openTime,
          close_time: closeTime,
        };
      })
      .filter(Boolean) as Array<Record<string, any>>;

    const withTradeId = mappedTrades.filter((trade) => !!trade.myfxbook_trade_id);
    const withoutTradeId = mappedTrades.filter((trade) => !trade.myfxbook_trade_id);

    const existingByTradeId = new Map<string, string>();

    const incomingIds = Array.from(new Set(withTradeId.map((trade) => String(trade.myfxbook_trade_id))));
    for (const idBatch of chunk(incomingIds, 200)) {
      const { data: existing, error: existingError } = await supabase
        .from("trades")
        .select("id,myfxbook_trade_id")
        .eq("user_id", user.id)
        .eq("source", "myfxbook")
        .in("myfxbook_trade_id", idBatch);

      if (existingError) {
        return json({ error: "Failed to sync trades to database." }, 500);
      }

      for (const row of existing ?? []) {
        const tradeId = String(row.myfxbook_trade_id ?? "").trim();
        if (tradeId) existingByTradeId.set(tradeId, row.id);
      }
    }

    const existingFallback = new Map<string, string>();
    const fallbackTimes = Array.from(new Set(withoutTradeId.map((trade) => trade.open_time).filter(Boolean)));

    for (const timeBatch of chunk(fallbackTimes, 200)) {
      const { data: existing, error: existingError } = await supabase
        .from("trades")
        .select("id,pair,open_time")
        .eq("user_id", user.id)
        .eq("source", "myfxbook")
        .in("open_time", timeBatch as string[]);

      if (existingError) {
        return json({ error: "Failed to sync trades to database." }, 500);
      }

      for (const row of existing ?? []) {
        const key = `${String(row.pair ?? "").trim()}|${row.open_time ?? ""}`;
        if (key !== "|") existingFallback.set(key, row.id);
      }
    }

    const updates: Array<Record<string, any>> = [];
    const inserts: Array<Record<string, any>> = [];

    for (const trade of mappedTrades) {
      const tradeId = String(trade.myfxbook_trade_id ?? "").trim();
      const fallbackKey = `${trade.pair}|${trade.open_time ?? ""}`;
      const existingId = tradeId ? existingByTradeId.get(tradeId) : existingFallback.get(fallbackKey);

      if (existingId) updates.push({ id: existingId, ...trade });
      else inserts.push(trade);
    }

    let updatedCount = 0;
    for (const updateBatch of chunk(updates, 200)) {
      if (!updateBatch.length) continue;
      const { error } = await supabase.from("trades").upsert(updateBatch, { onConflict: "id" });
      if (error) {
        return json({ error: "Failed to sync trades to database." }, 500);
      }
      updatedCount += updateBatch.length;
      await sleep(150);
    }

    let insertedCount = 0;
    for (const insertBatch of chunk(inserts, 200)) {
      if (!insertBatch.length) continue;
      const { error } = await supabase.from("trades").insert(insertBatch);
      if (error) {
        return json({ error: "Failed to sync trades to database." }, 500);
      }
      insertedCount += insertBatch.length;
      await sleep(150);
    }

    const syncedAt = new Date().toISOString();

    await supabase
      .from("profiles")
      .update({
        myfxbook_username: email,
        myfxbook_account_id: selectedAccountId,
        myfxbook_account_name:
          String(selectedAccount?.name ?? selectedAccount?.accountName ?? selectedAccount?.description ?? "") || null,
        myfxbook_broker: String(selectedAccount?.broker ?? "") || null,
        myfxbook_gain: toNumber(selectedAccount?.gain, 0),
        myfxbook_balance: toNumber(selectedAccount?.balance, 0),
        myfxbook_connected: true,
        last_synced_at: syncedAt,
      })
      .eq("user_id", user.id);

    return json({
      success: true,
      tradesCount: insertedCount + updatedCount,
      insertedCount,
      updatedCount,
      lastSynced: syncedAt,
      account: {
        account_id: selectedAccountId,
        account_name:
          String(selectedAccount?.name ?? selectedAccount?.accountName ?? selectedAccount?.description ?? "") || null,
        broker: String(selectedAccount?.broker ?? "") || null,
        gain: toNumber(selectedAccount?.gain, 0),
        balance: toNumber(selectedAccount?.balance, 0),
      },
    });
  } catch (err: any) {
    console.error("Myfxbook sync error:", err);
    return json(
      {
        error:
          String(err?.message || "").trim() ||
          "An unexpected error occurred while syncing Myfxbook trades.",
      },
      500
    );
  } finally {
    if (myfxSession) {
      try {
        const logoutUrl = new URL("https://www.myfxbook.com/api/logout.json");
        logoutUrl.searchParams.set("session", myfxSession);
        await fetch(logoutUrl);
      } catch (_logoutError) {
        // No-op
      }
    }
  }
});
