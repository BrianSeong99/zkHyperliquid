import { useState } from "react";

type OrderType = {
  price: number;
  size: number;
  total: number;
  depth: number; // percentage for visualization
};

export function OrderBook() {
  const [grouping, setGrouping] = useState<number>(0.1);
  const [displayType, setDisplayType] = useState<"default" | "cumulative">(
    "default"
  );

  // Sample data - in a real app, this would come from an API or websocket
  const buyOrders: OrderType[] = [
    { price: 3245.7, size: 2.5, total: 8114.25, depth: 100 },
    { price: 3245.6, size: 1.8, total: 5842.08, depth: 80 },
    { price: 3245.5, size: 3.2, total: 10385.6, depth: 90 },
    { price: 3245.4, size: 1.5, total: 4868.1, depth: 60 },
    { price: 3245.3, size: 0.8, total: 2596.24, depth: 40 },
    { price: 3245.2, size: 1.2, total: 3894.24, depth: 50 },
    { price: 3245.1, size: 0.5, total: 1622.55, depth: 30 },
    { price: 3245.0, size: 0.3, total: 973.5, depth: 20 },
  ];

  const sellOrders: OrderType[] = [
    { price: 3245.8, size: 1.2, total: 3894.96, depth: 60 },
    { price: 3245.9, size: 2.4, total: 7790.16, depth: 80 },
    { price: 3246.0, size: 3.1, total: 10062.6, depth: 200 },
    { price: 3246.1, size: 1.5, total: 4869.15, depth: 70 },
    { price: 3246.2, size: 0.7, total: 2272.34, depth: 40 },
    { price: 3246.3, size: 1.8, total: 5843.34, depth: 75 },
    { price: 3246.4, size: 0.5, total: 1623.2, depth: 30 },
    { price: 3246.5, size: 0.9, total: 2921.85, depth: 50 },
  ];

  const spreadValue = sellOrders[0].price - buyOrders[0].price;
  const spreadPercentage = (spreadValue / buyOrders[0].price) * 100;

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f]">
      <div className="p-4 border-b border-gray-800 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <select
              className="bg-[#0f0f0f] text-white text-sm rounded px-2 py-1 border border-gray-700"
              value={grouping}
              onChange={(e) => setGrouping(parseFloat(e.target.value))}
            >
              <option value={0.01}>0.01</option>
              <option value={0.1}>0.1</option>
              <option value={1}>1.0</option>
              <option value={10}>10.0</option>
            </select>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-4 text-xs text-gray-400 px-4 py-2 border-b border-gray-800 shrink-0">
        <div className="text-left">Price (USD)</div>
        <div className="text-right">Size (ETH)</div>
        <div className="text-right">Total (USD)</div>
        <div></div> {/* For depth visualization */}
      </div>

      <div className="flex-1 overflow-auto">
        {/* Sell Orders (reversed to show highest price at the bottom) */}
        <div>
          {sellOrders.map((order, index) => (
            <div
              key={`sell-${index}`}
              className="grid grid-cols-4 text-xs px-4 py-1 relative"
            >
              <div className="text-left text-[#f23645]">
                {order.price.toFixed(2)}
              </div>
              <div className="text-right">{order.size.toFixed(4)}</div>
              <div className="text-right">{order.total.toFixed(2)}</div>
              <div className="relative h-full">
                <div
                  className="absolute top-0 right-0 h-full bg-[#f23645] opacity-20"
                  style={{ width: `${order.depth}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Spread Indicator */}
        <div className="px-4 py-2 bg-[#1a1a1a] border-t border-b border-gray-700 text-xs flex justify-between">
          <span>Spread</span>
          <span>
            {spreadValue.toFixed(2)} ({spreadPercentage.toFixed(4)}%)
          </span>
        </div>

        {/* Buy Orders */}
        <div>
          {buyOrders.map((order, index) => (
            <div
              key={`buy-${index}`}
              className="grid grid-cols-4 text-xs px-4 py-1 relative"
            >
              <div className="text-left text-[#089981]">
                {order.price.toFixed(2)}
              </div>
              <div className="text-right">{order.size.toFixed(4)}</div>
              <div className="text-right">{order.total.toFixed(2)}</div>
              <div className="relative h-full">
                <div
                  className="absolute top-0 right-0 h-full bg-[#089981] opacity-20"
                  style={{ width: `${order.depth}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
