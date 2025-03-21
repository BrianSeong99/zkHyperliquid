import MarketHeader, { type MarketStat } from "./MarketHeader";
import TradingChart from "./TradingChart";

interface MarketChartSectionProps {
  marketPair: string;
  price: string;
  change: number;
  stats: MarketStat[];
}

const MarketChartSection = ({
  marketPair,
  price,
  change,
  stats,
}: MarketChartSectionProps) => {
  return (
    <div className="h-full flex flex-col">
      <MarketHeader
        marketPair={marketPair}
        price={price}
        change={change}
        stats={stats}
      />
      <TradingChart />
    </div>
  );
};

export default MarketChartSection;
