import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchMarkets, useMarkets, getUserPositions } from "../hooks/useContract";
import { MarketCard } from "../components/ui/market-card";
import { TakePositionDialog } from "../components/take-position-dialog";
import type { Market } from "../types";
import { useAccount } from "../hooks/useContract";

export default function MarketDetailsPage() {
  const { id } = useParams();
  const { markets, isLoading } = useMarkets();
  const { address, isConnected } = useAccount();

  const [market, setMarket] = useState<Market | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isYes, setIsYes] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<{ yesAmount: bigint, noAmount: bigint }>({ yesAmount: 0n, noAmount: 0n });
  const [comments, setComments] = useState<{ address: string, text: string }[]>([]);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<'holders' | 'comments'>('holders');

  useEffect(() => {
    async function fetchMarket() {
      setLoading(true);
      const found = markets.find((m) => m.id === Number(id));
      setMarket(found || null);
      setLoading(false);
      // Fetch user position for this market if user is connected
      if (found && isConnected && address) {
        try {
          const positions = await getUserPositions(address);
          const userMarket = positions.find((m) => m.id === Number(id));
          setUserPosition({
            yesAmount: userMarket?.userYesAmount ?? 0n,
            noAmount: userMarket?.userNoAmount ?? 0n,
          });
        } catch (e) {
          setUserPosition({ yesAmount: 0n, noAmount: 0n });
        }
      } else {
        setUserPosition({ yesAmount: 0n, noAmount: 0n });
      }
    }
    fetchMarket();
  }, [id, markets, isConnected, address]);

  const handleAddComment = () => {
    if (newComment.trim() && address) {
      setComments([...comments, { address, text: newComment }]);
      setNewComment("");
    }
  };

  const shortenAddress = (addr: string) => `${addr?.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : market && (
        <div className="max-w-3xl mx-auto mt-12 bg-white dark:bg-[#232526] rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
          {/* Left: Market Info */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">{market.question}</h2>
              <div className="mb-6 text-gray-700 dark:text-gray-200 text-lg whitespace-pre-line">
                {market.description}
              </div>
            </div>
            <div className="mt-8">
              <div className="mb-2 text-gray-500 dark:text-gray-400 text-sm">
                <span className="font-semibold">Total Pool:</span>{" "}
                <span className="text-indigo-600 dark:text-yellow-400 font-bold">
                  {(
                    (Number(market.totalYesAmount ?? 0n) + Number(market.totalNoAmount ?? 0n)) /
                    1e18
                  ).toLocaleString(undefined, { maximumFractionDigits: 4 })} SOM
                </span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                <span className="font-semibold">Ends:</span>{" "}
                {typeof market.endTime === "bigint"
                  ? new Date(Number(market.endTime) * 1000).toLocaleString()
                  : new Date(market.endTime).toLocaleString()}
              </div>
            </div>
          </div>
          {/* Right: User Position & Bet Buttons */}
          <div className="flex flex-col justify-center items-center bg-gray-50 dark:bg-[#2c3e50] p-8 md:w-72 gap-6">
            {/* Show user position and estimated winnings if they have any */}
            {(userPosition.yesAmount > 0n || userPosition.noAmount > 0n) && (() => {
              const yesPool = Number(market.totalYesAmount ?? 0n);
              const noPool = Number(market.totalNoAmount ?? 0n);
              const totalPool = yesPool + noPool;
              const userYes = Number(userPosition.yesAmount);
              const userNo = Number(userPosition.noAmount);
              let estYes = 0, estNo = 0;
              if (userYes > 0 && yesPool > 0) {
                estYes = userYes * totalPool / yesPool;
              }
              if (userNo > 0 && noPool > 0) {
                estNo = userNo * totalPool / noPool;
              }
              return (
                <div className="w-full mb-4 bg-blue-100/10 border border-blue-400 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-blue-400 font-bold text-lg mb-1">Your Position</span>
                  <span className="text-sm text-blue-200">
                    YES: {(userYes / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </span>
                  <span className="text-sm text-blue-200">
                    NO: {(userNo / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </span>
                  {(estYes > 0 || estNo > 0) && (
                    <div className="mt-2 text-xs text-yellow-300 text-center">
                      Estimated Winnings:
                      {estYes > 0 && (
                        <div>
                          <span className="font-semibold text-green-300">YES: </span>
                          {(estYes / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 })} SOM
                        </div>
                      )}
                      {estNo > 0 && (
                        <div>
                          <span className="font-semibold text-red-300">NO: </span>
                          {(estNo / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 })} SOM
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
            <button
              className="w-full py-3 mb-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow transition text-lg"
              onClick={() => {
                setIsYes(true);
                setOpenDialog(true);
              }}
            >
              Bet YES
            </button>
            <button
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow transition text-lg"
              onClick={() => {
                setIsYes(false);
                setOpenDialog(true);
              }}
            >
              Bet NO
            </button>
          </div>
          {/* Dialog */}
          <TakePositionDialog
            marketId={market.id}
            isYes={isYes}
            open={openDialog}
            onOpenChange={setOpenDialog}
          />
        </div>
      )}

      {/* Tabs for Top Holders and Comments */}
      <div className="max-w-3xl mx-auto mt-8 bg-white dark:bg-[#232526] rounded-2xl shadow-xl">
        <div className="flex justify-around border-b border-gray-300 dark:border-gray-700">
          <button
            className={`flex-1 py-2 text-center ${activeTab === 'holders' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('holders')}
          >
            Top Holders
          </button>
          <button
            className={`flex-1 py-2 text-center ${activeTab === 'comments' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'holders' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Holders</h3>
              {/* Placeholder for top holders */}
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-200">
                <li>User1: 1000 SOM</li>
                <li>User2: 800 SOM</li>
                <li>User3: 600 SOM</li>
              </ul>
            </div>
          )}
          {activeTab === 'comments' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Comments</h3>
              <div className="mb-4">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition"
                  onClick={handleAddComment}
                >
                  Post Comment
                </button>
              </div>
              <ul className="space-y-2">
                {comments.map((comment, index) => (
                  <li key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {shortenAddress(comment.address)}:
                    </span>
                    <span className="ml-2">{comment.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
