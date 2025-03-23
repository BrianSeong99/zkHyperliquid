import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

interface WalletActionsProps {
  balance: string;
  currency: string;
}

const WalletActions = ({ balance, currency }: WalletActionsProps) => (
  <div className="bg-[#0f0f0f] rounded-lg overflow-hidden h-full">
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Wallet size={16} className="mr-2 text-gray-400" />
          <span className="text-sm font-medium">Wallet Balance</span>
        </div>
        <span className="text-sm">
          {balance} {currency}
        </span>
      </div>
    </div>
    <div className="p-4">
      <div className="flex space-x-2">
        <button className="flex-1 py-2 px-3 bg-[#1e53e5] hover:bg-[#1a4ad0] rounded-md flex items-center justify-center transition-colors">
          <ArrowDownCircle size={16} className="mr-2" />
          <span>Deposit</span>
        </button>
        <button className="flex-1 py-2 px-3 bg-[#1a1a1a] hover:bg-[#252525] rounded-md flex items-center justify-center transition-colors">
          <ArrowUpCircle size={16} className="mr-2" />
          <span>Withdraw</span>
        </button>
      </div>
    </div>
  </div>
);

export default WalletActions;
