import { ChevronDown } from "lucide-react";

interface MarketStat {
  label: string;
  value: string;
}

interface MarketHeaderProps {
  marketPair: string;
  price: string;
  change: number;
  stats: MarketStat[];
}

const MarketHeader = ({
  marketPair,
  price,
  change,
  stats,
}: MarketHeaderProps) => (
  <div className="flex flex-wrap justify-between items-center mb-1">
    <div className="flex items-center space-x-2 bg-[#0f0f0f] rounded-lg p-2 w-full">
      <div className="flex items-center space-x-2 px-3 py-1.5 ">
        <span className="text-2xl font-medium">{marketPair}</span>
      </div>

      <div className="flex space-x-10 text-sm">
        <div className="flex flex-col items-start">
          <span className="text-gray-400 text-xs">Price</span>
          <span className={change < 0 ? "text-[#f23645]" : "text-[#089981]"}>
            ${price}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-gray-400 text-xs">24h Change</span>
          <span className={change < 0 ? "text-[#f23645]" : "text-[#089981]"}>
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        </div>
        {stats.map((stat: MarketStat, index: number) => (
          <div key={index} className="flex flex-col items-start">
            <span className="text-gray-400 text-xs">{stat.label}</span>
            <span>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default MarketHeader;
export type { MarketStat, MarketHeaderProps };
