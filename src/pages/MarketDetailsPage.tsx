import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMarkets } from "../hooks/useContract";
import { MarketCard } from "../components/ui/market-card";
import { TakePositionDialog } from "../components/take-position-dialog";
import type { Market } from "../types";

export default function MarketDetailsPage() {
  const { id } = useParams();
  const { getMarkets } = useMarkets();
  const [market, setMarket] = useState<Market | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isYes, setIsYes] = useState(true);

  useEffect(() => {
    async function fetchMarket() {
      const allMarkets = await getMarkets();
      const found = allMarkets.find((m) => m.id === Number(id));
      setMarket(found || null);
    }
    fetchMarket();
  }, [id, getMarkets]);

  if (!market) return <div className="p-8">Market not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">{market.question}</h2>
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-gray-200 rounded-full text-sm mr-2">
          Category: {market.category}
        </span>
        <span className="inline-block px-3 py-1 bg-gray-200 rounded-full text-sm">
          Ends: {typeof market.endTime === "bigint"
            ? new Date(Number(market.endTime) * 1000).toLocaleString()
            : new Date(market.endTime).toLocaleString()}
        </span>
      </div>
      <MarketCard
        market={market}
        userPosition={{
          yesAmount: market.userYesAmount || 0n,
          noAmount: market.userNoAmount || 0n,
        }}
        onTakePosition={() => setOpenDialog(true)}
        onResolve={() => {}}
        onClaim={() => {}}
        isCreator={false}
      />
      <div className="mt-6 flex gap-4">
        <button
          className="px-6 py-2 bg-green-500 text-white rounded"
          onClick={() => { setIsYes(true); setOpenDialog(true); }}
        >
          Bet YES
        </button>
        <button
          className="px-6 py-2 bg-red-500 text-white rounded"
          onClick={() => { setIsYes(false); setOpenDialog(true); }}
        >
          Bet NO
        </button>
      </div>
      <TakePositionDialog
        marketId={market.id}
        isYes={isYes}
        open={openDialog}
        onOpenChange={setOpenDialog}
      />
    </div>
  );
} 