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
  String(
    account?.id ??
      account?.accountId ??
      account?.account_id ??
      account?.accountid ??
      ""
  ).trim();

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
    const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const anonClient = createClient(supabaseUrl, publishableKey);

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

    // 1) Login
    const loginUrl = new URL("https://www.myfxbook.com/api/login.json");
    loginUrl.searchParams.set("email", email);
    loginUrl.searchParams.set("password", password);

    const loginRes = await fetch(loginUrl);
    if (!loginRes.ok) {
      return json({ error: "Myfxbook API is currently unavailable. Please try again." }, 503);
    }

    const loginData = await loginRes.json();
    if (loginData?.error || !loginData?.session) {
      return json({ error: "Myfxbook login failed. Please check your email and password." }, 400);
    }

    myfxSession = String(loginData.session);

    // 2) Fetch accounts
    const accountsUrl = new URL("https://www.myfxbook.com/api/get-my-accounts.json");
    accountsUrl.searchParams.set("session", myfxSession);

    const accountsRes = await fetch(accountsUrl);
    if (!accountsRes.ok) {
      return json({ error: "Myfxbook API is currently unavailable. Please try again." }, 503);
    }

    const accountsData = await accountsRes.json();
    const accounts = Array.isArray(accountsData?.accounts) ? accountsData.accounts : [];

    if (accountsData?.error || accounts.length === 0) {
      return json(
        { error: "Myfxbook account found but no trading accounts are connected." },
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

    const historyRes = await fetch(historyUrl);
    if (!historyRes.ok) {
      return json({ error: "Myfxbook API is currently unavailable. Please try again." }, 503);
    }

    const historyData = await historyRes.json();
    const history = Array.isArray(historyData?.history) ? historyData.history : [];

    if (historyData?.error) {
      return json({ error: "Invalid account ID. Please check and try again." }, 400);
    }

    if (history.length === 0) {
      return json({ error: "No closed trades were found on this Myfxbook account." }, 400);
    }

    const mappedTrades = history
      .map((trade: any) => {
        const openTime = toIsoOrNull(trade.openTime ?? trade.open_time ?? trade.openDate);
        const closeTime = toIsoOrNull(trade.closeTime ?? trade.close_time ?? trade.closeDate);
        const pair = String(trade.symbol ?? trade.pair ?? "").trim();

        if (!pair) return null;
        if (!openTime && !closeTime) return null;

        const myfxbookTradeId = String(
          trade.tradeId ?? trade.ticket ?? trade.order ?? trade.id ?? ""
        ).trim();

        const dateIso = closeTime ?? openTime;
        if (!dateIso) return null;

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

    if (mappedTrades.length === 0) {
      return json({ error: "No closed trades were found on this Myfxbook account." }, 400);
    }

    // 4) Deduplicate + create/update
    const { data: existingTrades, error: existingError } = await supabase
      .from("trades")
      .select("id,myfxbook_trade_id,pair,open_time")
      .eq("user_id", user.id)
      .eq("source", "myfxbook");

    if (existingError) {
      console.error("Failed to read existing trades", existingError);
      return json({ error: "Failed to sync trades to database." }, 500);
    }

    const byTradeId = new Map<string, string>();
    const byPairOpenTime = new Map<string, string>();

    for (const existing of existingTrades ?? []) {
      const existingTradeId = String(existing.myfxbook_trade_id ?? "").trim();
      if (existingTradeId) byTradeId.set(existingTradeId, existing.id);

      const openIso = existing.open_time ? new Date(existing.open_time).toISOString() : "";
      const fallbackKey = `${String(existing.pair ?? "").trim()}|${openIso}`;
      if (fallbackKey !== "|") byPairOpenTime.set(fallbackKey, existing.id);
    }

    const updates: Array<Record<string, any>> = [];
    const inserts: Array<Record<string, any>> = [];
    const processedIds = new Set<string>();
    const processedFallbacks = new Set<string>();

    for (const trade of mappedTrades) {
      const tradeId = String(trade.myfxbook_trade_id ?? "").trim();
      const fallbackKey = `${trade.pair}|${trade.open_time ?? ""}`;

      if (tradeId && processedIds.has(tradeId)) continue;
      if (!tradeId && processedFallbacks.has(fallbackKey)) continue;

      const existingId =
        (tradeId ? byTradeId.get(tradeId) : undefined) ?? byPairOpenTime.get(fallbackKey);

      if (existingId) {
        updates.push({ id: existingId, ...trade });
      } else {
        inserts.push(trade);
      }

      if (tradeId) processedIds.add(tradeId);
      else processedFallbacks.add(fallbackKey);
    }

    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from("trades")
        .upsert(updates, { onConflict: "id" });
      if (updateError) {
        console.error("Trade update error", updateError);
        return json({ error: "Failed to sync trades to database." }, 500);
      }
    }

    if (inserts.length > 0) {
      const { error: insertError } = await supabase.from("trades").insert(inserts);
      if (insertError) {
        console.error("Trade insert error", insertError);
        return json({ error: "Failed to sync trades to database." }, 500);
      }
    }

    const syncedAt = new Date().toISOString();

    await supabase
      .from("profiles")
      .update({
        myfxbook_username: email,
        myfxbook_account_id: selectedAccountId,
        myfxbook_account_name: String(
          selectedAccount?.name ?? selectedAccount?.accountName ?? selectedAccount?.description ?? ""
        ) || null,
        myfxbook_broker: String(selectedAccount?.broker ?? "") || null,
        myfxbook_gain: toNumber(selectedAccount?.gain, 0),
        myfxbook_balance: toNumber(selectedAccount?.balance, 0),
        myfxbook_connected: true,
        last_synced_at: syncedAt,
      })
      .eq("user_id", user.id);

    return json({
      success: true,
      tradesCount: inserts.length + updates.length,
      insertedCount: inserts.length,
      updatedCount: updates.length,
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
  } catch (err) {
    console.error("Myfxbook sync error:", err);
    return json({ error: "An unexpected error occurred while syncing Myfxbook trades." }, 500);
  } finally {
    if (myfxSession) {
      try {
        const logoutUrl = new URL("https://www.myfxbook.com/api/logout.json");
        logoutUrl.searchParams.set("session", myfxSession);
        await fetch(logoutUrl);
      } catch (logoutError) {
        console.error("Myfxbook logout warning:", logoutError);
      }
    }
  }
});
