/**
 * Service to interact with CoinGecko API to fetch cryptocurrency data
 */

type CryptoMarketData = {
  price: string;
  change: number;
  stats: {
    label: string;
    value: string;
  }[];
};

/**
 * Maps cryptocurrency symbols to CoinGecko IDs
 */
const cryptoIdMap: Record<string, string> = {
  "POL/USDC": "matic-network",
  "BTC/USDC": "bitcoin",
  "ETH/USDC": "ethereum",
  "SOL/USDC": "solana",
  "AVAX/USDC": "avalanche-2",
  // Add more mappings as needed
};

/**
 * Fetches cryptocurrency market data from CoinGecko API
 * @param marketPair - The market pair (e.g., "POL/USDC")
 * @returns Market data including price, 24h change, volume, and market cap
 */
export async function fetchCryptoMarketData(
  marketPair: string
): Promise<CryptoMarketData> {
  try {
    // Extract symbol from market pair
    const symbol = marketPair.split("/")[0];
    const coinId = cryptoIdMap[marketPair];

    if (!coinId) {
      throw new Error(`No CoinGecko ID mapping found for ${marketPair}`);
    }

    // Fetch data from CoinGecko API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Format the data
    const price = data.market_data.current_price.usd.toFixed(3);
    const change = data.market_data.price_change_percentage_24h;
    const volume = data.market_data.total_volume.usd;
    const marketCap = data.market_data.market_cap.usd;

    // Format volume and market cap with appropriate suffixes
    const formattedVolume = formatCurrency(volume);
    const formattedMarketCap = formatCurrency(marketCap);

    return {
      price,
      change,
      stats: [
        { label: "24h Volume", value: formattedVolume },
        { label: "Market Cap", value: formattedMarketCap },
        {
          label: "Contract",
          value: `${
            data.contract_address
              ? data.contract_address.substring(0, 6) +
                "..." +
                data.contract_address.substring(
                  data.contract_address.length - 3
                )
              : "N/A"
          }`,
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching crypto data:", error);

    // Return fallback data on error
    return {
      price: "0.00",
      change: 0,
      stats: [
        { label: "24h Volume", value: "$0" },
        { label: "Market Cap", value: "$0" },
        { label: "Contract", value: "N/A" },
      ],
    };
  }
}

/**
 * Format currency values with appropriate suffixes (K, M, B, T)
 */
function formatCurrency(value: number): string {
  if (value >= 1000000000000) {
    return `$${(value / 1000000000000).toFixed(2)}T`;
  } else if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

export type { CryptoMarketData };
