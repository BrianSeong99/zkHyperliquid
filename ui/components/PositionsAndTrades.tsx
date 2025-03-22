import { Clock, ArrowDownUp } from "lucide-react";

export function PositionsAndTrades() {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden h-full">
      <div className="flex border-b border-gray-800">
        <button className="flex-1 py-3 text-center bg-gray-800">
          Positions
        </button>
        <button className="flex-1 py-3 text-center">Orders</button>
        <button className="flex-1 py-3 text-center">Trades</button>
      </div>
      <div className="p-4">
        <div className="text-center text-gray-500 py-8">No open positions</div>
      </div>
    </div>
  );
}
