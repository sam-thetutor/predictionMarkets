import { useState } from 'react';
import { Button } from "./button";
import { formatDistanceToNow } from "date-fns";
import type { Market, UserPosition } from "../../types";
import { formatEther } from "viem";

interface MarketCardProps {
  market: Market;
  userPosition: UserPosition;
  onTakePosition: (marketId: number, isYes: boolean) => void;
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
  const [showDetails, setShowDetails] = useState(false);
  
  // Safely convert the endTime to a valid date
  let endTimeMs;
  let endDate;
  let timeRemaining;
  
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
  
  const isEnded = Date.now() > endTimeMs;
  const isResolved = market.resolved;
  
  // Calculate probabilities
  const yesPool = typeof market.totalYesAmount === 'bigint' ? market.totalYesAmount : BigInt(market.totalYesAmount || 0);
  const noPool = typeof market.totalNoAmount === 'bigint' ? market.totalNoAmount : BigInt(market.totalNoAmount || 0);
  
  const totalPool = Number(yesPool) + Number(noPool);
  const yesProbability = totalPool > 0 ? (Number(yesPool) / totalPool) * 100 : 50;
  const noProbability = totalPool > 0 ? (Number(noPool) / totalPool) * 100 : 50;

  return (
    <div className="bg-gray-700 rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium">{market.question}</h3>
        {market.resolved ? (
          <span className={`px-2 py-1 ${market.outcome === 1 ? 'bg-green-600' : 'bg-red-600'} text-xs rounded-full`}>
            {market.outcome === 1 ? "Yes" : "No"}
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-600 text-xs rounded-full">
            {timeRemaining}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded text-center">
          <div className="text-green-400 font-bold">YES</div>
          <div className="text-sm text-gray-400">{yesProbability.toFixed(1)}% probability</div>
          {userPosition.yesAmount > 0n && (
            <div className="mt-2 text-xs text-gray-400">
              Your position: {formatEther(userPosition.yesAmount)} SOM
            </div>
          )}
        </div>
        <div className="bg-gray-800 p-3 rounded text-center">
          <div className="text-red-400 font-bold">NO</div>
          <div className="text-sm text-gray-400">{noProbability.toFixed(1)}% probability</div>
          {userPosition.noAmount > 0n && (
            <div className="mt-2 text-xs text-gray-400">
              Your position: {formatEther(userPosition.noAmount)} SOM
            </div>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-400 mb-4">
        Total pool: {(totalPool / 1e18).toFixed(3)} SOM
      </div>
      
      {!isResolved && !isEnded && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="w-1/2" 
            onClick={() => onTakePosition(market.id, true)}
          >
             YES
          </Button>
          <Button 
            variant="outline" 
            className="w-1/2" 
            onClick={() => onTakePosition(market.id, false)}
          >
            NO
          </Button>
        </div>
      )}
      
      {!isResolved && isEnded && isCreator && (
        <Button 
          className="w-full" 
          onClick={() => onResolve(market.id)}
        >
          Resolve Market
        </Button>
      )}
      
      {isResolved && (
        (userPosition.yesAmount > 0n && market.outcome === 1) || 
        (userPosition.noAmount > 0n && market.outcome === 2) ? (
          <Button 
            className="w-full" 
            onClick={() => onClaim(market.id)}
          >
            Claim Winnings
          </Button>
        ) : null
      )}
    </div>
  );
} 