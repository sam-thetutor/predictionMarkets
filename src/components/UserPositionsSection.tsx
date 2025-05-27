import type { Market, UserPosition } from "../types";
import { MarketsList } from "./MarketsList";

interface UserPositionsSectionProps {
  userPositions: Market[];
  onTakePosition: (marketId: number, isYes: boolean) => void;
  onResolve: (marketId: number) => void;
  onClaim: (marketId: number) => void;
  address: string | null;
}

export function UserPositionsSection({
  userPositions,
  onTakePosition,
  onResolve,
  onClaim,
  address,
}: UserPositionsSectionProps) {
  if (userPositions.length === 0) return null;
  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-4">Your Positions</h2>
      <MarketsList
        markets={userPositions}
        onTakePosition={onTakePosition}
        onResolve={onResolve}
        onClaim={onClaim}
        address={address}
        limit={10}
      />
    </div>
  );
} 