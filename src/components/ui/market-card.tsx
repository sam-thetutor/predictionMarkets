import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
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
  const isEnded = new Date() > market.endTime;
  const totalPool = market.totalYesAmount + market.totalNoAmount;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{market.question}</CardTitle>
          {market.resolved ? (
            <Badge variant={market.outcome === 1 ? "success" : "destructive"}>
              {market.outcome === 1 ? "Yes" : "No"}
            </Badge>
          ) : (
            <Badge variant="outline">
              {isEnded ? "Ended" : `Ends ${formatDistanceToNow(market.endTime, { addSuffix: true })}`}
            </Badge>
          )}
        </div>
        <CardDescription>
          Total pool: {formatEther(totalPool)} SOM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <span className="text-lg font-bold">YES</span>
            <span className="text-sm text-muted-foreground">
              {formatEther(market.totalYesAmount)} SOM
            </span>
            {userPosition.yesAmount > 0n && (
              <Badge variant="outline" className="mt-2">
                Your position: {formatEther(userPosition.yesAmount)} SOM
              </Badge>
            )}
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <span className="text-lg font-bold">NO</span>
            <span className="text-sm text-muted-foreground">
              {formatEther(market.totalNoAmount)} SOM
            </span>
            {userPosition.noAmount > 0n && (
              <Badge variant="outline" className="mt-2">
                Your position: {formatEther(userPosition.noAmount)} SOM
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {!market.resolved && !isEnded && (
          <>
            <Button onClick={() => onTakePosition(market.id, true)}>Bet YES</Button>
            <Button onClick={() => onTakePosition(market.id, false)}>Bet NO</Button>
          </>
        )}
        {!market.resolved && isEnded && isCreator && (
          <Button onClick={() => onResolve(market.id)}>Resolve Market</Button>
        )}
        {market.resolved && (
          (userPosition.yesAmount > 0n && market.outcome === 1) || 
          (userPosition.noAmount > 0n && market.outcome === 2) ? (
            <Button onClick={() => onClaim(market.id)}>Claim Winnings</Button>
          ) : null
        )}
      </CardFooter>
    </Card>
  );
} 