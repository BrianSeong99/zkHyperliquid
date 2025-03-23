import { Clock, ArrowDownUp, RotateCw } from "lucide-react";
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { Orders, Order } from "./Orders";
import { useAccount } from "wagmi";

export function PositionsAndTrades() {
  const [activeTab, setActiveTab] = useState<
    | "positions"
    | "orders"
    | "trades"
    | "balances"
    | "orderHistory"
    | "tradeHistory"
  >("orders"); // Default to the orders tab

  const { address, isConnected } = useAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Function to fetch all orders for the connected user
  const fetchOrders = async () => {
    if (!isConnected || !address) return;

    setIsLoading(true);
    try {
      // Use the general orders endpoint instead of user-specific endpoint
      const response = await fetch(`http://localhost:3000/api/orders`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Handle the API response
      const data = await response.json();

      // Filter orders for the current user
      const userOrders = data.orders
        ? data.orders.filter(
            (order: Order) =>
              order.user_id.toLowerCase() === address.toLowerCase()
          )
        : [];

      setOrders(userOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      // Set empty orders array on error to prevent infinite loading
      setOrders([]);
    } finally {
      // Always stop loading regardless of success/failure
      setIsLoading(false);
    }
  };

  // Function to refresh a specific order
  const refreshOrder = async (orderId: string) => {
    try {
      // Since we don't have a specific order endpoint, get all orders and find the one we need
      const response = await fetch(`http://localhost:3000/api/orders`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Find the specific order in the response
      const allOrders = data.orders || [];
      const updatedOrder = allOrders.find(
        (order: Order) => order.id === orderId
      );

      if (!updatedOrder) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Update the orders list with the refreshed order
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      return updatedOrder;
    } catch (error) {
      console.error(`Failed to refresh order ${orderId}:`, error);
    }
  };

  // Function to add a new order to the list
  const addOrder = (newOrder: Order) => {
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
  };

  // Make the addOrder function available to other components
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).addOrderToTable = addOrder;
    }

    // Fetch orders initially when the component mounts and the user is connected
    if (isConnected && address) {
      fetchOrders();
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).addOrderToTable;
      }
    };
  }, [isConnected, address]);

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
        {isLoading && activeTab === "orders" && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {!isLoading && activeTab === "orders" && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm transition-colors"
                disabled={isLoading}
              >
                <span>Refresh</span>
                <RotateCw
                  size={14}
                  className={isLoading ? "animate-spin" : ""}
                />
              </button>
            </div>
            <Orders orders={orders} refreshOrder={refreshOrder} />
          </>
        )}

        {activeTab === "positions" && (
          <div className="text-center text-gray-500 py-8">
            No open positions
          </div>
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
