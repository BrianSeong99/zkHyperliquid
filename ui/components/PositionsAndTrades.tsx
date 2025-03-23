import { Clock, ArrowDownUp } from "lucide-react";
import { useState, useRef, useLayoutEffect } from "react";

export function PositionsAndTrades() {
  const [activeTab, setActiveTab] = useState<
    | "positions"
    | "orders"
    | "trades"
    | "balances"
    | "orderHistory"
    | "tradeHistory"
  >("positions");

  // Refs for each tab button
  const tabRefs = {
    positions: useRef<HTMLButtonElement>(null),
    orders: useRef<HTMLButtonElement>(null),
    trades: useRef<HTMLButtonElement>(null),
    balances: useRef<HTMLButtonElement>(null),
    orderHistory: useRef<HTMLButtonElement>(null),
    tradeHistory: useRef<HTMLButtonElement>(null),
  };

  // State for indicator position and width
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });

  // Update indicator position whenever active tab changes
  useLayoutEffect(() => {
    const currentTabRef = tabRefs[activeTab]?.current;

    if (currentTabRef) {
      setIndicatorStyle({
        left: currentTabRef.offsetLeft,
        width: currentTabRef.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="bg-[#0f0f0f] rounded-lg overflow-hidden h-full">
      <div className="border-b border-gray-800 relative overflow-x-auto">
        <div className="flex">
          <button
            ref={tabRefs.positions}
            className={`px-4 py-4 text-center text-sm font-medium whitespace-nowrap ${
              activeTab === "positions" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("positions")}
          >
            Positions
          </button>
          <button
            ref={tabRefs.orders}
            className={`px-4 py-4 text-center text-sm font-medium whitespace-nowrap ${
              activeTab === "orders" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            ref={tabRefs.trades}
            className={`px-4 py-4 text-center text-sm font-medium whitespace-nowrap ${
              activeTab === "trades" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("trades")}
          >
            Trades
          </button>
          <button
            ref={tabRefs.balances}
            className={`px-4 py-4 text-center text-sm font-medium whitespace-nowrap ${
              activeTab === "balances" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("balances")}
          >
            Balances
          </button>
          <button
            ref={tabRefs.orderHistory}
            className={`px-4 py-4 text-center text-sm font-medium whitespace-nowrap ${
              activeTab === "orderHistory" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("orderHistory")}
          >
            Order History
          </button>
          <button
            ref={tabRefs.tradeHistory}
            className={`px-4 py-4 text-center text-sm font-medium whitespace-nowrap ${
              activeTab === "tradeHistory" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("tradeHistory")}
          >
            Trade History
          </button>
        </div>

        {/* Animated bottom border */}
        <div
          className="absolute bottom-0 h-0.5 bg-[#1e53e5] transition-all duration-300 ease-in-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
      </div>
      <div className="p-4">
        {activeTab === "positions" && (
          <div className="text-center text-gray-500 py-8">
            No open positions
          </div>
        )}
        {activeTab === "orders" && (
          <div className="text-center text-gray-500 py-8">No active orders</div>
        )}
        {activeTab === "trades" && (
          <div className="text-center text-gray-500 py-8">No recent trades</div>
        )}
        {activeTab === "balances" && (
          <div className="text-center text-gray-500 py-8">No assets found</div>
        )}
        {activeTab === "orderHistory" && (
          <div className="text-center text-gray-500 py-8">No order history</div>
        )}
        {activeTab === "tradeHistory" && (
          <div className="text-center text-gray-500 py-8">No trade history</div>
        )}
      </div>
    </div>
  );
}
