import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { Settings } from "lucide-react";

export function Header() {
  return (
    <header className="w-full px-6 py-2 flex items-center justify-between bg-black text-white">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">zkHyperliquid</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/trade" className="hover:text-gray-300 transition-colors">
            Trade
          </Link>
          <Link
            href="/portfolio"
            className="hover:text-gray-300 transition-colors"
          >
            Portfolio
          </Link>
          <Link
            href="/leaderboard"
            className="hover:text-gray-300 transition-colors"
          >
            Leaderboard
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Connect Button */}
        <ConnectButton />

        {/* Settings Icon */}
        <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
