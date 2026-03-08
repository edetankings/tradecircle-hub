const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, currency } = await req.json();

    // For now, return curated sample data since free news APIs require keys
    // This can be upgraded to use NewsAPI, FinnHub, etc. with an API key
    const news = getNewsForCategory(category || 'forex');
    const events = getEconomicEvents();

    return new Response(
      JSON.stringify({ success: true, news, events }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch news' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getNewsForCategory(category: string) {
  const now = new Date().toISOString();
  if (category === 'crypto') {
    return [
      { title: 'Bitcoin Tests New Highs Amid Institutional Demand', description: 'BTC continues its upward trajectory as major institutions increase their crypto allocations.', url: 'https://coindesk.com', source: 'CoinDesk', publishedAt: now, category: 'crypto', impact: 'high', currency: 'USD' },
      { title: 'Ethereum Layer 2 Solutions See Record Activity', description: 'L2 networks process more transactions than ever as DeFi activity surges.', url: 'https://theblock.co', source: 'The Block', publishedAt: now, category: 'crypto', impact: 'medium' },
      { title: 'SEC Provides Clarity on Crypto Regulations', description: 'New regulatory framework offers clearer guidelines for digital asset exchanges.', url: 'https://reuters.com', source: 'Reuters', publishedAt: now, category: 'crypto', impact: 'high', currency: 'USD' },
      { title: 'Solana Ecosystem Continues Rapid Growth', description: 'New DeFi protocols and NFT marketplaces drive Solana adoption.', url: 'https://decrypt.co', source: 'Decrypt', publishedAt: now, category: 'crypto', impact: 'medium' },
    ];
  }
  return [
    { title: 'Federal Reserve Maintains Rate Decision', description: 'The Fed holds rates steady, signaling a data-dependent approach to future policy moves.', url: 'https://reuters.com', source: 'Reuters', publishedAt: now, category: 'forex', impact: 'high', currency: 'USD' },
    { title: 'EUR/USD Consolidates Ahead of ECB Meeting', description: 'Euro traders await the ECB policy decision with markets pricing in potential rate adjustments.', url: 'https://fxstreet.com', source: 'FX Street', publishedAt: now, category: 'forex', impact: 'medium', currency: 'EUR' },
    { title: 'GBP Rallies on Strong UK Employment Data', description: 'Sterling gains as UK labor market shows resilience despite economic headwinds.', url: 'https://bloomberg.com', source: 'Bloomberg', publishedAt: now, category: 'forex', impact: 'high', currency: 'GBP' },
    { title: 'Japanese Yen Weakens on BOJ Policy Stance', description: 'USD/JPY rises as Bank of Japan maintains accommodative monetary policy.', url: 'https://nikkei.com', source: 'Nikkei', publishedAt: now, category: 'forex', impact: 'high', currency: 'JPY' },
    { title: 'Australian Dollar Under Pressure from China Data', description: 'AUD/USD drops following weaker-than-expected Chinese manufacturing PMI.', url: 'https://cnbc.com', source: 'CNBC', publishedAt: now, category: 'forex', impact: 'medium', currency: 'AUD' },
    { title: 'CAD Faces Headwinds from Oil Price Decline', description: 'USD/CAD tests resistance as crude oil prices continue their bearish trend.', url: 'https://marketwatch.com', source: 'MarketWatch', publishedAt: now, category: 'forex', impact: 'medium', currency: 'CAD' },
  ];
}

function getEconomicEvents() {
  return [
    { title: 'Non-Farm Payrolls', country: 'US', currency: 'USD', impact: 'high', date: '2026-03-08', time: '08:30 EST', forecast: '180K', previous: '175K' },
    { title: 'ECB Interest Rate Decision', country: 'EU', currency: 'EUR', impact: 'high', date: '2026-03-08', time: '07:45 EST', forecast: '4.25%', previous: '4.25%' },
    { title: 'UK GDP (MoM)', country: 'UK', currency: 'GBP', impact: 'high', date: '2026-03-08', time: '02:00 EST', forecast: '0.2%', previous: '0.1%', actual: '0.3%' },
    { title: 'Australia Employment Change', country: 'AU', currency: 'AUD', impact: 'medium', date: '2026-03-08', time: '19:30 EST', forecast: '25.0K', previous: '22.5K' },
    { title: 'Canada Trade Balance', country: 'CA', currency: 'CAD', impact: 'medium', date: '2026-03-08', time: '08:30 EST', forecast: '-1.2B', previous: '-0.8B' },
    { title: 'Japan Core CPI (YoY)', country: 'JP', currency: 'JPY', impact: 'medium', date: '2026-03-08', time: '18:30 EST', forecast: '2.8%', previous: '2.6%' },
    { title: 'Switzerland CPI (MoM)', country: 'CH', currency: 'CHF', impact: 'low', date: '2026-03-08', time: '02:30 EST', forecast: '0.1%', previous: '0.0%' },
  ];
}
