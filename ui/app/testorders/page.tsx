"use client";

import { useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";

interface OrderMessage {
  pair_id: string;
  amount: number;
  price: number;
  side: boolean;
}

export default function TestOrdersPage() {
  const [amount, setAmount] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [pairId, setPairId] = useState<string>("BTC/USD");
  const [side, setSide] = useState<boolean>(true); // true for buy, false for sell
  const [orderResult, setOrderResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get the user's Ethereum address
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Create an order message for signing
  const createOrderMessage = (): OrderMessage => {
    // Convert to integers (multiplied by 10000 to preserve 4 decimal places)
    const amountInt = Math.floor(parseFloat(amount) * 10000);
    const priceInt = Math.floor(parseFloat(price) * 10000);

    return {
      pair_id: pairId,
      amount: amountInt,
      price: priceInt,
      side: side,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      setOrderResult(
        JSON.stringify({ error: "Wallet not connected" }, null, 2)
      );
      return;
    }

    setIsLoading(true);
    setOrderResult("");

    try {
      // Create the order message
      const orderMessage = createOrderMessage();

      // Convert the order message to a string for signing
      // This directly matches the format in the backend format_order_message function
      const messageString = JSON.stringify(orderMessage);

      // Sign the message
      const signature = await signMessageAsync({ message: messageString });

      // Prepare the order data
      const orderData = {
        user_id: address,
        pair_id: orderMessage.pair_id,
        amount: orderMessage.amount,
        price: orderMessage.price,
        side: orderMessage.side,
        signature: signature,
      };

      // Log the order data to the console for testing
      console.log("Sending order:", orderData);
      console.log("Signed message:", messageString);

      // Send the order to the API
      const response = await fetch("http://localhost:3001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      // Check if the response is ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server responded with status ${response.status}: ${errorText}`
        );
      }

      // Try to parse the response as JSON
      const text = await response.text();
      let data;
      try {
        data = text
          ? JSON.parse(text)
          : { message: "Empty response from server" };
      } catch (e) {
        console.error("Failed to parse response:", text);
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }

      setOrderResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error placing order:", error);
      setOrderResult(
        JSON.stringify(
          {
            error: "Failed to place order",
            details: error instanceof Error ? error.message : String(error),
          },
          null,
          2
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="mt-8 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Test Orders</h1>

        {!isConnected && (
          <div className="mb-6 p-4 bg-yellow-800 text-yellow-100 rounded-lg">
            <p>Please connect your wallet to place an order.</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-900 p-6 rounded-lg"
        >
          <div>
            <label
              htmlFor="pairId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Trading Pair
            </label>
            <select
              id="pairId"
              value={pairId}
              onChange={(e) => setPairId(e.target.value)}
              className="w-full rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white px-4 py-2"
            >
              <option value="BTC/USD">BTC/USD</option>
              <option value="ETH/USD">ETH/USD</option>
              <option value="SOL/USD">SOL/USD</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.0001"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white px-4 py-2"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Price
            </label>
            <input
              id="price"
              type="number"
              step="0.0001"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white px-4 py-2"
              placeholder="Enter price"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Side
            </label>
            <div className="flex">
              <button
                type="button"
                className={`flex-1 py-2 rounded-md ${
                  side ? "bg-green-600" : "bg-gray-800"
                }`}
                onClick={() => setSide(true)}
              >
                Buy
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-md ml-2 ${
                  !side ? "bg-red-600" : "bg-gray-800"
                }`}
                onClick={() => setSide(false)}
              >
                Sell
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isConnected}
            className={`w-full py-3 rounded-md font-medium ${
              isLoading || !isConnected
                ? "bg-gray-700 text-gray-400"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading ? "Processing..." : "Place Test Order"}
          </button>
        </form>

        {orderResult && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Order Result:</h2>
            <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
              {orderResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
