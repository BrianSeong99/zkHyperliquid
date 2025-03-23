import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

interface MarketSelectorProps {
  marketPair: string;
  onMarketPairChange: (marketPair: string) => void;
}

// Market pairs with clear labels
const marketPairs = [
  "POL/USDC", // Polygon (MATIC)
  "BTC/USDC",
  "ETH/USDC",
  "SOL/USDC",
];

// Friendly names for display
const marketPairLabels: Record<string, string> = {
  "POL/USDC": "POL/USDC",
  "BTC/USDC": "BTC/USDC",
  "ETH/USDC": "ETH/USDC",
  "SOL/USDC": "SOL/USDC",
};

// Cryptocurrency icons (these would need to be added to your public directory)
const cryptoIcons: Record<string, string> = {
  "POL/USDC": "https://cryptologos.cc/logos/polygon-matic-logo.svg?v=042",
  "BTC/USDC": "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=042",
  "ETH/USDC": "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=042",
  "SOL/USDC": "https://cryptologos.cc/logos/solana-sol-logo.svg?v=042",
};

const MarketSelector = ({
  marketPair,
  onMarketPairChange,
}: MarketSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectMarketPair = (pair: string) => {
    onMarketPairChange(pair);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center bg-[#0f0f0f] hover:bg-[#1e1e1e] rounded-lg px-3 py-2 space-x-2"
      >
        {cryptoIcons[marketPair] && (
          <div className="w-5 h-5 relative">
            <img
              src={cryptoIcons[marketPair]}
              alt={marketPair.split("/")[0]}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <span className="font-medium">{marketPair}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[#0f0f0f] border border-[#424242] rounded-lg shadow-lg w-40">
          <ul>
            {marketPairs.map((pair) => (
              <li key={pair}>
                <button
                  onClick={() => selectMarketPair(pair)}
                  className={`w-full text-left px-4 py-2 hover:bg-[#1e1e1e] ${
                    marketPair === pair ? "bg-[#1e1e1e] font-medium" : ""
                  } flex items-center`}
                >
                  {cryptoIcons[pair] && (
                    <div className="w-5 h-5 relative mr-2">
                      <img
                        src={cryptoIcons[pair]}
                        alt={pair.split("/")[0]}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  {marketPairLabels[pair] || pair}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MarketSelector;
