import MarketHeader, { type MarketStat } from "./MarketHeader";
import TradingChart from "./TradingChart";

interface MarketChartSectionProps {
  marketPair: string;
  price: string;
  change: number;
  stats: MarketStat[];
  isLoading?: boolean;
  onMarketPairChange?: (marketPair: string) => void;
}

const MarketChartSection = ({
  marketPair,
  price,
  change,
  stats,
  isLoading = false,
  onMarketPairChange,
}: MarketChartSectionProps) => {
  return (
    <div className="h-full flex flex-col">
      <MarketHeader
        marketPair={marketPair}
        price={price}
        change={change}
        stats={stats}
        isLoading={isLoading}
        onMarketPairChange={onMarketPairChange}
      />
      <TradingChart />
    </div>
  );
};

export default MarketChartSection;
