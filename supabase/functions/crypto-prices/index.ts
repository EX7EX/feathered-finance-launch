import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CACHE_TTL_SECONDS = 60;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const coins = url.searchParams.get("coins") || "bitcoin,ethereum,solana,cardano";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check cache first
    const coinIds = coins.split(",").map((c: string) => c.trim());
    const { data: cached } = await supabase
      .from("price_cache")
      .select("*")
      .in("coin_id", coinIds);

    const now = new Date();
    const allFresh =
      cached &&
      cached.length === coinIds.length &&
      cached.every(
        (row: any) =>
          (now.getTime() - new Date(row.updated_at).getTime()) / 1000 < CACHE_TTL_SECONDS
      );

    if (allFresh) {
      const formatted = cached!.map((row: any) => ({
        symbol: row.symbol.toUpperCase() + "/USDT",
        price: Number(row.current_price),
        change24h: (row.price_change_percentage_24h?.toFixed(1) || "0.0") + "%",
        volume24h: Number(row.total_volume || 0),
        marketCap: Number(row.market_cap || 0),
        image: row.image || "",
      }));

      return new Response(JSON.stringify(formatted), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coins}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
      { headers: { Accept: "application/json" } }
    );

    if (!response.ok) {
      // If CoinGecko fails, return stale cache if available
      if (cached && cached.length > 0) {
        const formatted = cached.map((row: any) => ({
          symbol: row.symbol.toUpperCase() + "/USDT",
          price: Number(row.current_price),
          change24h: (row.price_change_percentage_24h?.toFixed(1) || "0.0") + "%",
          volume24h: Number(row.total_volume || 0),
          marketCap: Number(row.market_cap || 0),
          image: row.image || "",
        }));
        return new Response(JSON.stringify(formatted), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const jsonData = await response.json();

    // Update cache
    for (const coin of jsonData) {
      await supabase.from("price_cache").upsert(
        {
          coin_id: coin.id,
          symbol: coin.symbol,
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          total_volume: coin.total_volume,
          market_cap: coin.market_cap,
          image: coin.image,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "coin_id" }
      );
    }

    // Also update exchange rates in supported_currencies
    for (const coin of jsonData) {
      const code = coin.symbol.toUpperCase();
      await supabase
        .from("supported_currencies")
        .update({ exchange_rate_to_usd: coin.current_price, updated_at: new Date().toISOString() })
        .eq("code", code);
    }

    const formatted = jsonData.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase() + "/USDT",
      price: coin.current_price,
      change24h: (coin.price_change_percentage_24h?.toFixed(1) || "0.0") + "%",
      volume24h: coin.total_volume,
      marketCap: coin.market_cap,
      image: coin.image,
    }));

    return new Response(JSON.stringify(formatted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
