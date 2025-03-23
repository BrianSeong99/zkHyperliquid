import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

// Types
interface TradingFormProps {
  orderType: "market" | "limit";
  setOrderType: (type: "market" | "limit") => void;
  side: "buy" | "sell";
  setSide: (side: "buy" | "sell") => void;
  currentPrice?: string; // Current market price from API
  isLoading?: boolean; // Whether price data is loading
  marketPair?: string; // Current market pair (e.g., "POL/USDC")
}

// Default assets if no market pair is provided
const DEFAULT_ASSETS = {
  BASE: "POL",
  QUOTE: "USDC",
};

const BALANCES = {
  USDC: 9.8,
  POL: 100,
  BTC: 0.01,
  ETH: 0.5,
  SOL: 5,
};

// Common components
interface AvailableBalanceProps {
  side: "buy" | "sell";
  assets: {
    BASE: string;
    QUOTE: string;
  };
  balances: Record<string, number>;
}

const AvailableBalance = ({
  side,
  assets,
  balances,
}: AvailableBalanceProps) => {
  const balanceAsset = side === "buy" ? assets.QUOTE : assets.BASE;
  const balanceAmount = balances[balanceAsset] || 0; // Default to 0 if balance not found

  return (
    <div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">Available to Trade</span>
        <span className="text-sm">
          {balanceAmount.toFixed(2)} {balanceAsset}
        </span>
      </div>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  asset: string;
}

const InputField = ({ label, value, onChange, asset }: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Ensure total digits don't exceed 10 (combined before and after decimal)
    if (value === "" || value === ".") {
      onChange(e);
    } else {
      // Count all digits
      const digitCount = value.replace(/[^0-9]/g, "").length;
      if (digitCount <= 13 && /^\d*\.?\d*$/.test(value)) {
        onChange(e);
      }
    }
  };

  return (
    <div
      className={`bg-[#0f0f0f] border ${
        isFocused ? "border-[#1e53e5]" : "border-gray-700"
      } rounded-md px-4 py-3 transition-colors duration-200`}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400 flex-shrink-0 mr-4">
          {label}
        </span>
        <div className="flex items-center flex-grow">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="bg-transparent text-right w-full focus:outline-none focus:ring-0 focus:border-transparent"
            placeholder="0.00"
          />
          <span className="ml-2 text-gray-400 flex-shrink-0">{asset}</span>
        </div>
      </div>
    </div>
  );
};

interface OrderButtonProps {
  side: "buy" | "sell";
  isValid: boolean;
  onClick: () => void;
  isSubmitting: boolean;
}

const OrderButton = ({
  side,
  isValid,
  onClick,
  isSubmitting,
}: OrderButtonProps) => (
  <div>
    <button
      className={`w-full py-3 rounded-md font-medium ${
        isValid
          ? side === "buy"
            ? "bg-[#089981] text-white"
            : "bg-[#f23645] text-white"
          : "bg-[#1a1a1a] text-gray-400"
      }`}
      disabled={!isValid || isSubmitting}
      onClick={onClick}
    >
      {isSubmitting ? "Submitting..." : "Place Order"}
    </button>
  </div>
);

interface FeesDisplayProps {}

const FeesDisplay = ({}: FeesDisplayProps) => (
  <div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">Fees</span>
      <span className="text-sm text-gray-400">Est: 0% / Max: 0.010%</span>
    </div>
  </div>
);

// API submit function
const submitOrder = async (orderData: {
  user_id: string;
  pair_id: string;
  amount: number;
  price?: number;
  side: boolean;
}) => {
  try {
    // Convert decimal values to integers with 6 decimal places (multiply by 10^6)
    const DECIMALS = 6;

    // Helper function to convert float to raw integer with 6 decimal precision
    const floatToInteger = (value: number): number => {
      // Simply multiply by 10^DECIMALS and round to avoid floating point precision issues
      const result = Math.round(value * Math.pow(10, DECIMALS));

      // Check if the result exceeds u64 max value (2^64 - 1)
      // Using a safe approximation since we can't represent the full u64 max in JavaScript
      const U64_MAX_SAFE_APPROX = Number.MAX_SAFE_INTEGER; // This is conservative but safer

      if (result > U64_MAX_SAFE_APPROX || result < 0) {
        throw new Error(
          `Value ${value} would result in an integer that exceeds allowed limits after conversion`
        );
      }

      return result;
    };

    // Create a copy of the order data with converted values
    const formattedOrderData = {
      ...orderData,
      // Convert amount to integer with 6 decimals
      amount: floatToInteger(orderData.amount),
      // Convert price to integer with 6 decimals if present
      price: orderData.price ? floatToInteger(orderData.price) : undefined,
    };

    console.log("Submitting order:", orderData);
    console.log("Formatted with 6 decimals as integers:", formattedOrderData);

    // Using the proper URL with correct port (3000) as defined in the server
    const response = await fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedOrderData),
      // Include credentials for CORS
      credentials: "include",
    });

    console.log("Response:", response);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server error: ${response.status}`, errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    console.log("Response ok");

    // Get the order data from the response
    const orderResponse = await response.json();
    console.log("Order placed successfully:", orderResponse);

    // Add the order to the orders table if the addOrderToTable function exists
    if (typeof window !== "undefined" && (window as any).addOrderToTable) {
      try {
        (window as any).addOrderToTable(orderResponse);
      } catch (addOrderError) {
        console.error("Error adding order to table:", addOrderError);
        // Don't throw here, as the order was successfully placed
      }
    }

    return orderResponse;
  } catch (error) {
    console.error("Failed to submit order:", error);
    throw error;
  }
};

// Order Form Components
interface OrderFormProps {
  side: "buy" | "sell";
  orderType: "market" | "limit";
  currentPrice?: string;
  isLoading?: boolean;
  assets: {
    BASE: string;
    QUOTE: string;
  };
  balances: {
    [asset: string]: number;
  };
}

const MarketOrderForm = ({
  side,
  orderType,
  currentPrice,
  isLoading,
  assets,
  balances,
}: OrderFormProps) => {
  const { address, isConnected } = useAccount();
  const [size, setSize] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate order value based on current price
  const orderValue =
    currentPrice && size ? Number(currentPrice) * Number(size) : null;

  // Determine if button should be enabled
  const isValid = size !== "" && Number(size) > 0 && isConnected && !!address;

  const handleSubmit = async () => {
    if (!isValid || !address || !currentPrice) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await submitOrder({
        user_id: address,
        pair_id: `${assets.BASE}/${assets.QUOTE}`,
        amount: Number(size),
        price: Number(currentPrice), // Use current market price for market orders
        side: side === "buy", // true for buy, false for sell
      });

      // Add slight delay before resetting form
      setTimeout(() => {
        // Reset form on success
        setSize("");
        // Show success message
        setError(null);
      }, 500);

      return result;
    } catch (err: any) {
      console.error("Market order submission error:", err);

      // Extract detailed error message if available
      let errorMessage = "Failed to submit order. Please try again.";
      if (err.message) {
        // Check if it's a server error with details
        const serverErrorMatch = err.message.match(/Error: \d+ - (.*)/);
        if (serverErrorMatch && serverErrorMatch[1]) {
          errorMessage = serverErrorMatch[1];
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      // Delay setting isSubmitting to false slightly to ensure state is updated correctly
      setTimeout(() => {
        setIsSubmitting(false);
      }, 200);
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="space-y-4 flex-grow">
        <AvailableBalance side={side} assets={assets} balances={balances} />

        <InputField
          label={`Size (${assets.BASE})`}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          asset={assets.BASE}
        />

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Order Value
          </label>
          <div className="text-sm">
            {isLoading ? (
              <span className="h-4 w-16 bg-gray-700 animate-pulse rounded inline-block"></span>
            ) : currentPrice ? (
              <div>
                <div>
                  Market Price: ${currentPrice} {assets.QUOTE}
                </div>
                {orderValue && (
                  <div className="mt-2">
                    Value: ~{orderValue.toFixed(2)} {assets.QUOTE}
                  </div>
                )}
              </div>
            ) : (
              "Market Price Unavailable"
            )}
          </div>
        </div>

        {error && <div className="text-sm text-[#f23645] mt-2">{error}</div>}
      </div>

      <FeesDisplay />
      <OrderButton
        side={side}
        isValid={isValid && !!currentPrice && !isLoading}
        onClick={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

const LimitOrderForm = ({
  side,
  orderType,
  assets,
  balances,
}: OrderFormProps) => {
  const { address, isConnected } = useAccount();
  const [price, setPrice] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate order value
  const orderValue = price && size ? Number(price) * Number(size) : null;

  // Determine if button should be enabled
  const isValid =
    price !== "" &&
    size !== "" &&
    Number(price) > 0 &&
    Number(size) > 0 &&
    isConnected &&
    !!address;

  const handleSubmit = async () => {
    if (!isValid || !address) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await submitOrder({
        user_id: address,
        pair_id: `${assets.BASE}/${assets.QUOTE}`,
        amount: Number(size),
        price: Number(price),
        side: side === "buy", // true for buy, false for sell
      });

      // Add slight delay before resetting form
      setTimeout(() => {
        // Reset form on success
        setPrice("");
        setSize("");
        // Show success message
        setError(null);
      }, 500);

      return result;
    } catch (err: any) {
      console.error("Limit order submission error:", err);

      // Extract detailed error message if available
      let errorMessage = "Failed to submit order. Please try again.";
      if (err.message) {
        // Check if it's a server error with details
        const serverErrorMatch = err.message.match(/Error: \d+ - (.*)/);
        if (serverErrorMatch && serverErrorMatch[1]) {
          errorMessage = serverErrorMatch[1];
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      // Delay setting isSubmitting to false slightly to ensure state is updated correctly
      setTimeout(() => {
        setIsSubmitting(false);
      }, 200);
    }
  };

  return (
    <div className="space-y-2 flex flex-col h-full">
      <div className="space-y-4 flex-grow">
        <AvailableBalance side={side} assets={assets} balances={balances} />

        <InputField
          label={`Price (${assets.QUOTE})`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          asset={assets.QUOTE}
        />

        <InputField
          label={`Size (${assets.BASE})`}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          asset={assets.BASE}
        />

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Order Value
          </label>
          <div className="text-sm">
            {orderValue ? `${orderValue.toFixed(2)} ${assets.QUOTE}` : "N/A"}
          </div>
        </div>

        {error && <div className="text-sm text-[#f23645] mt-2">{error}</div>}
      </div>

      <FeesDisplay />
      <OrderButton
        side={side}
        isValid={isValid}
        onClick={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

// Trading Form Component
export const TradingForm = ({
  orderType,
  setOrderType,
  side,
  setSide,
  currentPrice,
  isLoading,
  marketPair = "POL/USDC",
}: TradingFormProps) => {
  const { isConnected } = useAccount();

  // Extract base and quote assets from the market pair
  const [baseAsset, quoteAsset] = marketPair.split("/");

  // Create the ASSETS object
  const ASSETS = {
    BASE: baseAsset || DEFAULT_ASSETS.BASE,
    QUOTE: quoteAsset || DEFAULT_ASSETS.QUOTE,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#0f0f0f] rounded-lg overflow-hidden flex-grow flex flex-col">
        <div className="flex border-b border-gray-800 relative">
          <button
            className={`flex-1 py-3 text-center text-sm font-medium ${
              orderType === "market" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => setOrderType("market")}
          >
            Market
          </button>
          <button
            className={`flex-1 py-3 text-center text-sm font-medium ${
              orderType === "limit" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => setOrderType("limit")}
          >
            Limit
          </button>

          {/* Animated bottom border */}
          <div
            className="absolute bottom-0 h-0.5 bg-[#1e53e5] transition-all duration-300 ease-in-out"
            style={{
              left: orderType === "market" ? "0" : "50%",
              width: "50%",
            }}
          />
        </div>

        <div className="p-4 flex flex-col h-full">
          <div className="flex mb-4">
            <button
              className={`flex-1 py-2 rounded-md ${
                side === "buy"
                  ? "bg-[#089981]"
                  : "bg-[#0f0f0f] border border-gray-700"
              }`}
              onClick={() => setSide("buy")}
            >
              Buy
            </button>
            <button
              className={`flex-1 py-2 rounded-md ml-2 ${
                side === "sell"
                  ? "bg-[#f23645]"
                  : "bg-[#0f0f0f] border border-gray-700"
              }`}
              onClick={() => setSide("sell")}
            >
              Sell
            </button>
          </div>

          {!isConnected && (
            <div className="mb-4 p-3 bg-gray-800 text-gray-300 rounded-md text-sm text-center">
              Please connect your wallet to place an order
            </div>
          )}

          {orderType === "market" ? (
            <MarketOrderForm
              side={side}
              orderType={orderType}
              currentPrice={currentPrice}
              isLoading={isLoading}
              assets={ASSETS}
              balances={BALANCES}
            />
          ) : (
            <LimitOrderForm
              side={side}
              orderType={orderType}
              assets={ASSETS}
              balances={BALANCES}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingForm;
