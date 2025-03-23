import { ChevronDown } from "lucide-react";
import MarketSelector from "./MarketSelector";

// Market pair to full name mapping
const marketPairLabels: Record<string, string> = {
  "POL/USDC": "POL/USDC (Polygon)",
  "BTC/USDC": "BTC/USDC (Bitcoin)",
  "ETH/USDC": "ETH/USDC (Ethereum)",
  "SOL/USDC": "SOL/USDC (Solana)",
};

interface MarketStat {
  label: string;
  value: string;
}

interface MarketHeaderProps {
  marketPair: string;
  price: string;
  change: number;
  stats: MarketStat[];
  isLoading?: boolean;
  onMarketPairChange?: (marketPair: string) => void;
}

const MarketHeader = ({
  marketPair,
  price,
  change,
  stats,
  isLoading = false,
  onMarketPairChange,
}: MarketHeaderProps) => (
  <div className="flex flex-wrap justify-between items-center mb-1">
    <div className="flex items-center space-x-2 bg-[#0f0f0f] rounded-lg p-2 w-full">
      <div className="flex items-center space-x-2 px-3 py-1.5 ">
        {onMarketPairChange ? (
          <MarketSelector
            marketPair={marketPair}
            onMarketPairChange={onMarketPairChange}
          />
        ) : (
          <span className="text-2xl font-medium">
            {marketPairLabels[marketPair] || marketPair}
          </span>
        )}
      </div>

      <div className="flex space-x-10 text-sm">
        <div className="flex flex-col items-start">
          <span className="text-gray-400 text-xs">Price</span>
          {isLoading ? (
            <span className="h-4 w-16 bg-gray-700 animate-pulse rounded"></span>
          ) : (
            <span className={change < 0 ? "text-[#f23645]" : "text-[#089981]"}>
              ${price}
            </span>
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-gray-400 text-xs">24h Change</span>
          {isLoading ? (
            <span className="h-4 w-12 bg-gray-700 animate-pulse rounded"></span>
          ) : (
            <span className={change < 0 ? "text-[#f23645]" : "text-[#089981]"}>
              {change > 0 ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          )}
        </div>
        {stats.map((stat: MarketStat, index: number) => (
          <div key={index} className="flex flex-col items-start">
            <span className="text-gray-400 text-xs">{stat.label}</span>
            {isLoading ? (
              <span className="h-4 w-14 bg-gray-700 animate-pulse rounded"></span>
            ) : (
              <span>{stat.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default MarketHeader;
export type { MarketStat, MarketHeaderProps };
