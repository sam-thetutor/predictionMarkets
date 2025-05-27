import type { Market, UserPosition } from "../types";
import { MarketCard } from "./ui/market-card";
import { Link } from "react-router-dom";

interface MarketsListProps {
  markets: Market[];
  userPositions?: Record<number, UserPosition>;
  onTakePosition: (marketId: number, isYes: boolean) => void;
  onResolve: (marketId: number) => void;
  onClaim: (marketId: number) => void;
  address: string | null;
  limit?: number;
}

export function MarketsList({
  markets,
  userPositions,
  onTakePosition,
  onResolve,
  onClaim,
  address,
  limit = 10,
}: MarketsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {markets.slice(0, limit).map((market) => {
        const userPosition =
          userPositions?.[market.id] || {
            yesAmount: market.userYesAmount || 0n,
            noAmount: market.userNoAmount || 0n,
          };
        return (
          <Link to={`/market/${market.id}`} key={market.id} className="block">
            <MarketCard
              market={market}
              userPosition={userPosition}
              onTakePosition={onTakePosition}
              onResolve={onResolve}
              onClaim={onClaim}
              isCreator={market.creator === address}
            />
          </Link>
        );
      })}
    </div>
  );
} 