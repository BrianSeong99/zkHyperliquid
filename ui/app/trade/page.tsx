"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { OrderBookAndTrades } from "@/components/OrderBookAndTrades";
import { PositionsAndTrades } from "@/components/PositionsAndTrades";
import WalletActions from "@/components/WalletActions";
import MarketChartSection from "@/components/MarketChartSection";
import { TradingForm } from "@/components/TradingForm";
import { ArrowDownUp } from "lucide-react";

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
    <div className="flex flex-col h-screen bg-[#2e2e2e]">
      <Header />
      <div className="flex flex-col h-full p-1 gap-1">
        {/* Top section */}
        <div className="grid grid-cols-16 gap-1">
          {/* Left Column: Chart */}
          <div className="col-span-10">
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
          <div className="col-span-3">
            <TradingForm
              orderType={orderType}
              setOrderType={setOrderType}
              side={side}
              setSide={setSide}
            />
          </div>
        </div>

        {/* Bottom section - fill remaining height */}
        <div className="grid grid-cols-16 gap-1 flex-1">
          {/* Bottom Left */}
          <div className="col-span-13 h-full">
            <PositionsAndTrades />
          </div>

          {/* Bottom Right */}
          <div className="col-span-3 h-full">
            <WalletActions balance="125.45" currency="USDC" />
          </div>
        </div>
      </div>
    </div>
  );
}
