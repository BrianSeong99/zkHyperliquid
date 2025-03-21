"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { OrderBookAndTrades } from "@/components/OrderBookAndTrades";
import { PositionsAndTrades } from "@/components/PositionsAndTrades";
import WalletActions from "@/components/WalletActions";
import MarketChartSection from "@/components/MarketChartSection";
import { ArrowDownUp } from "lucide-react";

// Types
interface TradingFormProps {
  orderType: "market" | "limit";
  setOrderType: (type: "market" | "limit") => void;
  side: "buy" | "sell";
  setSide: (side: "buy" | "sell") => void;
}

// Trading Form Component
const TradingForm = ({
  orderType,
  setOrderType,
  side,
  setSide,
}: TradingFormProps) => (
  <div className="flex flex-col h-full">
    <div className="bg-gray-900 rounded-lg overflow-hidden flex-grow">
      <div className="flex border-b border-gray-800">
        <button
          className={`flex-1 py-3 text-center ${
            orderType === "market" ? "bg-gray-800" : ""
          }`}
          onClick={() => setOrderType("market")}
        >
          Market
        </button>
        <button
          className={`flex-1 py-3 text-center ${
            orderType === "limit" ? "bg-gray-800" : ""
          }`}
          onClick={() => setOrderType("limit")}
        >
          Limit
        </button>
      </div>

      <div className="p-4">
        <div className="flex mb-4">
          <button
            className={`flex-1 py-2 rounded-md ${
              side === "buy" ? "bg-green-600" : "bg-gray-800"
            }`}
            onClick={() => setSide("buy")}
          >
            Buy
          </button>
          <button
            className={`flex-1 py-2 rounded-md ml-2 ${
              side === "sell" ? "bg-red-600" : "bg-gray-800"
            }`}
            onClick={() => setSide("sell")}
          >
            Sell
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Available to Trade
            </label>
            <div className="text-sm">9.80 USDC</div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Size</label>
            <div className="flex">
              <input
                type="text"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-right"
                placeholder="0.00"
              />
              <span className="ml-2 flex items-center text-gray-400">USDC</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Order Value
            </label>
            <div className="text-sm">N/A</div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Fees</label>
            <div className="text-sm text-gray-400">Est: 0% / Max: 0.010%</div>
          </div>

          <div className="pt-2">
            <button className="w-full py-3 rounded-md font-medium bg-gray-800 text-gray-400">
              Enable Trading
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function TradePage() {
  const [orderType, setOrderType] = useState<"market" | "limit">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [marketPair, setMarketPair] = useState<string>("POL/USDC");

  // Market data (would come from API in a real app)
  const marketData = {
    price: "13.024",
    change: -4.6,
    stats: [
      { label: "24h Volume", value: "$4.35B" },
      { label: "Market Cap", value: "$134.84B" },
      { label: "Contract", value: "0x0d01...1ec" },
    ],
  };

  return (
    <div className="flex flex-col h-full m-1">
      <div className="grid grid-cols-16 gap-1 ">
        {/* Top Row*/}
        <div className="col-span-10 ">
          {/* Left Column: Chart */}
          <MarketChartSection
            marketPair={marketPair}
            price={marketData.price}
            change={marketData.change}
            stats={marketData.stats}
          />
        </div>

        {/* Middle Column */}
        <div className="col-span-3 h-[670px]">
          <OrderBookAndTrades />
        </div>

        {/* Right Column */}
        <div className="col-span-3 ">
          <TradingForm
            orderType={orderType}
            setOrderType={setOrderType}
            side={side}
            setSide={setSide}
          />
        </div>

        {/* Bottom Row */}
        <div className="col-span-13">
          <PositionsAndTrades />
        </div>

        {/* Bottom Row */}
        <div className="col-span-3">
          <WalletActions balance="125.45" currency="USDC" />
        </div>
      </div>
    </div>
  );
}
