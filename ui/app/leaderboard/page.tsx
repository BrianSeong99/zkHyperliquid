export default function LeaderboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

          {/* Time Period Filter */}
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1 w-fit">
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white">
              24h
            </button>
            <button className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">
              7d
            </button>
            <button className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">
              30d
            </button>
            <button className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">
              All Time
            </button>
          </div>

          {/* Leaderboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Total Volume</h2>
              <p className="text-2xl font-bold">$24,567,890</p>
              <p className="text-gray-400">Across all traders</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Top Trader PnL</h2>
              <p className="text-2xl font-bold text-green-500">+$345,678</p>
              <p className="text-gray-400">+45.7% return</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Active Traders</h2>
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-gray-400">In the last 24 hours</p>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Top Traders</h2>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-400">Sort by:</span>
                <select className="bg-gray-700 text-white rounded px-3 py-1 text-sm">
                  <option>PnL</option>
                  <option>ROI</option>
                  <option>Volume</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Trader
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Volume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      PnL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ROI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Win Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Trades
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {/* Sample leaderboard data */}
                  <tr className="bg-yellow-900 bg-opacity-20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-2">1</span>
                        <svg
                          className="h-5 w-5 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16a1 1 0 11-2 0V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                          <span className="font-bold">TS</span>
                        </div>
                        <span>0x7a23...45df</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">$5,432,167</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +$345,678
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +45.7%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">78%</td>
                    <td className="px-6 py-4 whitespace-nowrap">234</td>
                  </tr>
                  <tr className="bg-gray-700 bg-opacity-20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-gray-300 mr-2">2</span>
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16a1 1 0 11-2 0V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                          <span className="font-bold">JD</span>
                        </div>
                        <span>0x3f56...78ab</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">$4,876,543</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +$298,765
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +38.2%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">72%</td>
                    <td className="px-6 py-4 whitespace-nowrap">189</td>
                  </tr>
                  <tr className="bg-orange-900 bg-opacity-20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-orange-500 mr-2">3</span>
                        <svg
                          className="h-5 w-5 text-orange-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16a1 1 0 11-2 0V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center mr-3">
                          <span className="font-bold">AK</span>
                        </div>
                        <span>0x9e12...67cd</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">$3,654,321</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +$245,678
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +32.5%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">68%</td>
                    <td className="px-6 py-4 whitespace-nowrap">156</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">4</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center mr-3">
                          <span className="font-bold">MR</span>
                        </div>
                        <span>0x2d45...91ef</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">$2,987,654</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +$198,765
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +28.9%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">65%</td>
                    <td className="px-6 py-4 whitespace-nowrap">143</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">5</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-yellow-600 flex items-center justify-center mr-3">
                          <span className="font-bold">PL</span>
                        </div>
                        <span>0x8b34...12de</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">$2,345,678</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +$176,543
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-500">
                      +25.4%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">62%</td>
                    <td className="px-6 py-4 whitespace-nowrap">132</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
              <button className="px-4 py-2 bg-gray-700 rounded-md text-sm">
                Previous
              </button>
              <div className="text-sm text-gray-400">
                Showing 1-5 of 100 traders
              </div>
              <button className="px-4 py-2 bg-blue-600 rounded-md text-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
