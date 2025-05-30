import { Button } from "./button";
import { formatDistanceToNow } from "date-fns";
import type { Market, UserPosition } from "../../types";

interface MarketCardProps {
  market: Market;
  userPosition?: UserPosition;
  onTakePosition: (marketId:number, isYes: boolean) => void;
  onResolve: (marketId: number) => void;
  onClaim: (marketId: number) => void;
  isCreator: boolean;
}

export function MarketCard({
  market,
  userPosition,
  onTakePosition,
  onResolve,
  onClaim,
  isCreator,
}: MarketCardProps) {
  
  // Safely convert the endTime to a valid date
  let endTimeMs;
  let endDate;
  let timeRemaining;

  console.log("market", userPosition,
    onTakePosition,
    onResolve,
    onClaim,
    isCreator,timeRemaining)
  
  try {
    // Ensure we're working with a number and it's valid
    endTimeMs = typeof market.endTime === 'bigint' 
      ? Number(market.endTime) * 1000 
      : Number(market.endTime) * 1000;
    
    // Validate the timestamp is reasonable (between 2020 and 2050)
    const minTimestamp = new Date('2020-01-01').getTime();
    const maxTimestamp = new Date('2050-01-01').getTime();
    
    if (endTimeMs < minTimestamp || endTimeMs > maxTimestamp) {
      console.warn('Invalid timestamp detected:', endTimeMs);
      endTimeMs = Date.now() + 86400000; // Default to tomorrow
    }
    
    endDate = new Date(endTimeMs);
    timeRemaining = endTimeMs < Date.now() 
      ? 'Ended' 
      : formatDistanceToNow(endDate, { addSuffix: true });
  } catch (error) {
    console.error('Error processing date:', error);
    endTimeMs = Date.now() + 86400000; // Default to tomorrow
    endDate = new Date(endTimeMs);
    timeRemaining = 'Unknown';
  }
  
  // const isEnded = Date.now() > endTimeMs;
  // const isResolved = market.resolved;
  
  // Calculate probabilities
  const yesPool = typeof market.totalYesAmount === 'bigint' ? market.totalYesAmount : BigInt(market.totalYesAmount || 0);
  const noPool = typeof market.totalNoAmount === 'bigint' ? market.totalNoAmount : BigInt(market.totalNoAmount || 0);
  
  const totalPool = Number(yesPool) + Number(noPool);
  // const yesProbability = totalPool > 0 ? (Number(yesPool) / totalPool) * 100 : 50;
  //   const noProbability = totalPool > 0 ? (Number(noPool) / totalPool) * 100 : 50;

  return (
    <div className="bg-[#2C2C3A] text-white border border-[#3A3A4A] rounded-lg p-4 shadow-md transition-transform transform hover:translate-y-[-5px] hover:border-[var(--accent-color)]">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{market.question}</h3>
        <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
          {typeof market.endTime === "bigint"
            ? `Ends ${formatDistanceToNow(new Date(Number(market.endTime) * 1000))}`
            : `Ends ${formatDistanceToNow(new Date(market.endTime))}`
          }
        </span>
      </div>
      {/* <div className="text-sm text-gray-300 mb-2">
        Category: <span className="font-semibold">{market.category}</span>
      </div> */}
      <div className="text-sm text-gray-400 mb-4">
        Total pool: {totalPool ? totalPool/1e18 : "0"} STT
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="w-1/2 bg-green-300 text-white cursor-pointer"
          onClick={() => onTakePosition(market.id, true)}
        >
          YES
        </Button>
        <Button
          variant="outline"
          className="w-1/2 bg-red-300 text-white cursor-pointer"
          onClick={() => onTakePosition(market.id, false)}
        >
          NO
        </Button>
      </div>
    </div>
  );
} 