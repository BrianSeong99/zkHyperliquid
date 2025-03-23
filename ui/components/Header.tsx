import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { Settings } from "lucide-react";

export function Header() {
  return (
    <header className="w-full px-6 py-2 h-[50px] flex items-center justify-between bg-[#0f0f0f] text-white border-b border-gray-800">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">zkHyperliquid</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/trade"
            className="hover:text-[#1e53e5] transition-colors"
          >
            Trade
          </Link>
          <span
            className="text-gray-500 cursor-not-allowed"
            title="Coming soon"
          >
            Portfolio
          </span>
          <span
            className="text-gray-500 cursor-not-allowed"
            title="Coming soon"
          >
            Leaderboard
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Connect Button */}
        <ConnectButton />

        {/* Settings Icon */}
        <button className="p-2 rounded-full hover:bg-[#1a1a1a] transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
