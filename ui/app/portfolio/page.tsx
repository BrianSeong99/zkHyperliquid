import { Header } from "@/components/Header";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Total Value</h2>
              <p className="text-2xl font-bold">$10,245.67</p>
              <p className="text-green-500">+5.67% (24h)</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">PnL</h2>
              <p className="text-2xl font-bold">+$1,245.67</p>
              <p className="text-green-500">+12.3% (all time)</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Open Positions</h2>
              <p className="text-2xl font-bold">5</p>
              <p className="text-gray-400">Across 3 markets</p>
            </div>
          </div>

          {/* Positions Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden mb-8">
            <h2 className="text-xl font-semibold p-6 border-b border-gray-700">
              Open Positions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Market
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Side
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Entry Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Mark Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      PnL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {/* Sample position data */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">ETH-PERP</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      Long
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">2.5 ETH</td>
                    <td className="px-6 py-4 whitespace-nowrap">$3,245.67</td>
                    <td className="px-6 py-4 whitespace-nowrap">$3,345.67</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +$250.00 (+7.7%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                        Close
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">BTC-PERP</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-500">
                      Short
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">0.5 BTC</td>
                    <td className="px-6 py-4 whitespace-nowrap">$65,245.67</td>
                    <td className="px-6 py-4 whitespace-nowrap">$64,845.67</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +$200.00 (+0.6%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                        Close
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Trade History */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <h2 className="text-xl font-semibold p-6 border-b border-gray-700">
              Trade History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Market
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Side
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Fee
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {/* Sample trade history data */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      2023-06-15 14:32:45
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">ETH-PERP</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      Buy
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">1.5 ETH</td>
                    <td className="px-6 py-4 whitespace-nowrap">$3,245.67</td>
                    <td className="px-6 py-4 whitespace-nowrap">$4,868.51</td>
                    <td className="px-6 py-4 whitespace-nowrap">$2.43</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      2023-06-14 09:15:22
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">BTC-PERP</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-500">
                      Sell
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">0.25 BTC</td>
                    <td className="px-6 py-4 whitespace-nowrap">$64,245.67</td>
                    <td className="px-6 py-4 whitespace-nowrap">$16,061.42</td>
                    <td className="px-6 py-4 whitespace-nowrap">$8.03</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
