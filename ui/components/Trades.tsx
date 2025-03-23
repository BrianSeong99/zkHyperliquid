import { useState } from "react";

type TradeType = {
  price: number;
  size: number;
  time: string;
  isBuy: boolean;
};

export function Trades() {
  // Sample data - in a real app, this would come from an API or websocket
  const trades: TradeType[] = [
    { price: 12850, size: 2.63, time: "21:07:58", isBuy: true },
    { price: 12842, size: 10.29, time: "21:07:56", isBuy: false },
    { price: 12844, size: 10.0, time: "21:07:56", isBuy: false },
    { price: 12846, size: 34.96, time: "21:07:56", isBuy: false },
    { price: 12846, size: 7.61, time: "21:07:56", isBuy: false },
    { price: 12846, size: 5.0, time: "21:07:54", isBuy: false },
    { price: 12845, size: 2.42, time: "21:07:53", isBuy: true },
    { price: 12844, size: 2.8, time: "21:07:51", isBuy: true },
    { price: 12841, size: 6.74, time: "21:07:46", isBuy: true },
    { price: 12839, size: 3.36, time: "21:07:45", isBuy: false },
    { price: 12842, size: 0.9, time: "21:07:44", isBuy: true },
    { price: 12842, size: 2.16, time: "21:07:44", isBuy: true },
    { price: 12838, size: 7.64, time: "21:07:42", isBuy: true },
    { price: 12836, size: 18.82, time: "21:07:39", isBuy: false },
    { price: 12839, size: 41.72, time: "21:07:39", isBuy: false },
    { price: 12837, size: 40.72, time: "21:07:39", isBuy: false },
    { price: 12838, size: 10.0, time: "21:07:39", isBuy: false },
    { price: 12844, size: 12.77, time: "21:07:39", isBuy: true },
    { price: 12839, size: 60.86, time: "21:07:38", isBuy: false },
    { price: 12839, size: 41.72, time: "21:07:38", isBuy: false },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12844, size: 0.97, time: "21:07:38", isBuy: true },
    { price: 12841, size: 2.4, time: "21:07:38", isBuy: true },
    { price: 12837, size: 1.01, time: "21:07:36", isBuy: false },
    { price: 12836, size: 1.57, time: "21:07:33", isBuy: false },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f]">
      {/* Column Headers */}
      <div className="grid grid-cols-3 text-xs text-gray-400 px-4 py-2 border-b border-gray-800 shrink-0">
        <div className="text-left">Price (POL)</div>
        <div className="text-right">Size (POL)</div>
        <div className="text-right">Time</div>
      </div>

      {/* Trades List - with hidden scrollbar */}
      <div className=" overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
        {trades.map((trade, index) => (
          <div
            key={`trade-${index}`}
            className="grid grid-cols-3 text-xs px-4 py-1"
          >
            <div
              className={`text-left ${
                trade.isBuy ? "text-[#089981]" : "text-[#f23645]"
              }`}
            >
              {trade.price.toFixed(0)}
            </div>
            <div className="text-right">{trade.size.toFixed(2)}</div>
            <div className="text-right flex justify-end items-center">
              {trade.time}
              <svg
                className="ml-1 w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 17L17 7M17 7H7M17 7V17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
