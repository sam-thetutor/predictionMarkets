import type { Market } from "../types";
import { MarketsList } from "./MarketsList";

interface AllMarketsSectionProps {
  markets: Market[];
  onTakePosition: (marketId: number, isYes: boolean) => void;
  onResolve: (marketId: number) => void;
  onClaim: (marketId: number) => void;
  address: string | null;
}

export function AllMarketsSection({
  markets,
  onTakePosition,
  onResolve,
  onClaim,
  address,
}: AllMarketsSectionProps) {
  return (
    <MarketsList
      markets={markets}
      onTakePosition={onTakePosition}
      onResolve={onResolve}
      onClaim={onClaim}
      address={address}
      limit={10}
    />
  );
} 