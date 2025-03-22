import { useState } from "react";
import { OrderBook } from "./OrderBook";
import { Trades } from "./Trades";

export function OrderBookAndTrades() {
  const [activeTab, setActiveTab] = useState<"orderbook" | "trades">(
    "orderbook"
  );

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header with tabs */}
      <div className="flex border-b border-gray-800 relative shrink-0">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium text-center ${
            activeTab === "orderbook" ? "text-white" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("orderbook")}
        >
          Order Book
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium text-center ${
            activeTab === "trades" ? "text-white" : "text-gray-400"
          }`}
          onClick={() => setActiveTab("trades")}
        >
          Trades
        </button>

        {/* Animated bottom border */}
        <div
          className="absolute bottom-0 h-0.5 bg-blue-500 transition-all duration-300 ease-in-out"
          style={{
            left: activeTab === "orderbook" ? "0" : "50%",
            width: "50%",
          }}
        />
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 overflow-hidden">
        {/* Order Book */}
        <div
          className={`w-full h-full ${
            activeTab === "orderbook" ? "block" : "hidden"
          }`}
        >
          <OrderBook />
        </div>

        {/* Trades */}
        <div
          className={`w-full h-full ${
            activeTab === "trades" ? "block" : "hidden"
          }`}
        >
          <Trades />
        </div>
      </div>
    </div>
  );
}
