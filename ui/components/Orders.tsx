import { useState, useEffect } from "react";
import { ArrowDownUp, RotateCw, Check, Clock, X } from "lucide-react";

export interface Order {
  id: string;
  user_id: string;
  pair_id: string;
  amount: number;
  filled_amount: number;
  price: number;
  side: boolean;
  status: string;
  created_at: number;
  updated_at: number;
}

interface OrdersProps {
  orders: Order[];
  refreshOrder: (orderId: string) => Promise<void>;
}

// Constants
const DECIMALS = 6; // Number of decimal places used for amount and price values
const DECIMAL_FACTOR = Math.pow(10, DECIMALS); // 10^6 for conversion

export function Orders({ orders, refreshOrder }: OrdersProps) {
  return (
    <div className="w-full overflow-x-auto">
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No active orders</div>
      ) : (
        <table className="w-full min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-2 px-4 text-gray-400 font-medium">
                Market
              </th>
              <th className="text-left py-2 px-4 text-gray-400 font-medium">
                Side
              </th>
              <th className="text-right py-2 px-4 text-gray-400 font-medium">
                Size
              </th>
              <th className="text-right py-2 px-4 text-gray-400 font-medium">
                Price
              </th>
              <th className="text-right py-2 px-4 text-gray-400 font-medium">
                Filled
              </th>
              <th className="text-center py-2 px-4 text-gray-400 font-medium">
                Status
              </th>
              <th className="text-right py-2 px-4 text-gray-400 font-medium">
                Time
              </th>
              <th className="text-center py-2 px-4 text-gray-400 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                refreshOrder={refreshOrder}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function OrderRow({
  order,
  refreshOrder,
}: {
  order: Order;
  refreshOrder: (orderId: string) => Promise<void>;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrder(order.id);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format the date
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Filled":
        return <Check size={16} className="text-green-500" />;
      case "Canceled":
        return <X size={16} className="text-red-500" />;
      case "Pending":
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  // Convert from fixed-point to float
  const fromFixedPoint = (value: number): number => {
    return value / DECIMAL_FACTOR;
  };

  return (
    <tr className="border-b border-gray-800 hover:bg-[#1a1a1a]">
      <td className="py-3 px-4">{order.pair_id}</td>
      <td
        className={`py-3 px-4 ${
          order.side ? "text-green-500" : "text-red-500"
        }`}
      >
        {order.side ? "Buy" : "Sell"}
      </td>
      <td className="py-3 px-4 text-right">
        {fromFixedPoint(order.amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })}
      </td>
      <td className="py-3 px-4 text-right">
        {fromFixedPoint(order.price).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })}
      </td>
      <td className="py-3 px-4 text-right">
        {((order.filled_amount / order.amount) * 100).toFixed(0)}%
      </td>
      <td className="py-3 px-4 text-center">
        <div className="flex items-center justify-center">
          {getStatusIcon(order.status)}
          <span className="ml-1">{order.status}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-right">{formatTime(order.created_at)}</td>
      <td className="py-3 px-4 text-center">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1 rounded hover:bg-gray-700 transition-colors"
          title="Refresh order status"
        >
          <RotateCw
            size={16}
            className={`${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </td>
    </tr>
  );
}
