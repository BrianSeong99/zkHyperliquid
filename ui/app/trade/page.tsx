"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { OrderBookAndTrades } from "@/components/OrderBookAndTrades";
import { PositionsAndTrades } from "@/components/PositionsAndTrades";
import WalletActions from "@/components/WalletActions";
import MarketChartSection from "@/components/MarketChartSection";
import { TradingForm } from "@/components/TradingForm";
import { ArrowDownUp } from "lucide-react";
import {
  fetchCryptoMarketData,
  type CryptoMarketData,
} from "@/services/cryptoApi";

export default function TradePage() {
  const [orderType, setOrderType] = useState<"market" | "limit">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [marketPair, setMarketPair] = useState<string>("POL/USDC");
  const [marketData, setMarketData] = useState<CryptoMarketData>({
    price: "0.00",
    change: 0,
    stats: [
      { label: "24h Volume", value: "$0" },
      { label: "Market Cap", value: "$0" },
      { label: "Contract", value: "N/A" },
    ],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch market data on component mount and when market pair changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCryptoMarketData(marketPair);
        setMarketData(data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [marketPair]);

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
              isLoading={isLoading}
              onMarketPairChange={setMarketPair}
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
              currentPrice={marketData.price}
              isLoading={isLoading}
              marketPair={marketPair}
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
