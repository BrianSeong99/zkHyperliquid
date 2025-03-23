import { useState } from "react";

// Types
interface TradingFormProps {
  orderType: "market" | "limit";
  setOrderType: (type: "market" | "limit") => void;
  side: "buy" | "sell";
  setSide: (side: "buy" | "sell") => void;
}

// Constants and utilities
const ASSETS = {
  BASE: "POL",
  QUOTE: "USDC",
};

const BALANCES = {
  [ASSETS.QUOTE]: 9.8,
  [ASSETS.BASE]: 100,
};

// Common components
interface AvailableBalanceProps {
  side: "buy" | "sell";
}

const AvailableBalance = ({ side }: AvailableBalanceProps) => {
  const balanceAsset = side === "buy" ? ASSETS.QUOTE : ASSETS.BASE;
  const balanceAmount = BALANCES[balanceAsset];

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
}

const OrderButton = ({ side, isValid }: OrderButtonProps) => (
  <div>
    <button
      className={`w-full py-3 rounded-md font-medium ${
        isValid
          ? side === "buy"
            ? "bg-[#089981] text-white"
            : "bg-[#f23645] text-white"
          : "bg-[#1a1a1a] text-gray-400"
      }`}
      disabled={!isValid}
    >
      Place Order
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

// Order Form Components
const MarketOrderForm = ({ side }: { side: "buy" | "sell" }) => {
  const [size, setSize] = useState<string>("");

  // Determine if button should be enabled
  const isValid = size !== "" && Number(size) > 0;

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="space-y-4 flex-grow">
        <AvailableBalance side={side} />

        <InputField
          label={`Size (${ASSETS.BASE})`}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          asset={ASSETS.BASE}
        />

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Order Value
          </label>
          <div className="text-sm">Market Price ({ASSETS.QUOTE})</div>
        </div>
      </div>

      <FeesDisplay />
      <OrderButton side={side} isValid={isValid} />
    </div>
  );
};

const LimitOrderForm = ({ side }: { side: "buy" | "sell" }) => {
  const [price, setPrice] = useState<string>("");
  const [size, setSize] = useState<string>("");

  // Calculate order value
  const orderValue = price && size ? Number(price) * Number(size) : null;

  // Determine if button should be enabled
  const isValid =
    price !== "" && size !== "" && Number(price) > 0 && Number(size) > 0;

  return (
    <div className="space-y-2 flex flex-col h-full">
      <div className="space-y-4 flex-grow">
        <AvailableBalance side={side} />

        <InputField
          label={`Price (${ASSETS.QUOTE})`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          asset={ASSETS.QUOTE}
        />

        <InputField
          label={`Size (${ASSETS.BASE})`}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          asset={ASSETS.BASE}
        />

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Order Value
          </label>
          <div className="text-sm">
            {orderValue ? `${orderValue.toFixed(2)} ${ASSETS.QUOTE}` : "N/A"}
          </div>
        </div>
      </div>

      <FeesDisplay />
      <OrderButton side={side} isValid={isValid} />
    </div>
  );
};

// Trading Form Component
export const TradingForm = ({
  orderType,
  setOrderType,
  side,
  setSide,
}: TradingFormProps) => (
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

        {orderType === "market" ? (
          <MarketOrderForm side={side} />
        ) : (
          <LimitOrderForm side={side} />
        )}
      </div>
    </div>
  </div>
);

export default TradingForm;
