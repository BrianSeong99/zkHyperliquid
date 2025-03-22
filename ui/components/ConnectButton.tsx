"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { sepolia } from "@reown/appkit/networks";

export const ConnectButton = () => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();

  // Check if user is on the wrong chain
  const isWrongChain = isConnected && chainId !== sepolia.id;

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: sepolia.id });
    }
  };

  return (
    <div>
      {isWrongChain && (
        <button
          onClick={handleSwitchNetwork}
          className="px-4 py-2 bg-red-600 text-white rounded-lg mb-2 hover:bg-red-700 transition-colors"
        >
          Switch to Sepolia
        </button>
      )}
      <appkit-button />
    </div>
  );
};
