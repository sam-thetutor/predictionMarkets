import { useState, useEffect } from 'react';
import { useAccount, useMarkets, useTakePosition, useClaimWinnings } from './hooks/useContract';
import type { Market, UserPosition } from './types';
import { MarketCard } from './components/ui/market-card';
import { CreateMarketDialog } from './components/create-market-dialog';
import { TakePositionDialog } from './components/take-position-dialog';
import { ResolveMarketDialog } from './components/resolve-market-dialog';
import { Button } from './components/ui/button';
import './App.css';

function App() {
  const { address, isConnected, connect } = useAccount();
  const { getMarkets } = useMarkets();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [isYes, setIsYes] = useState(false);
  const [openPositionDialog, setOpenPositionDialog] = useState(false);
  const [openResolveDialog, setOpenResolveDialog] = useState(false);
  
  const { claimWinnings } = useClaimWinnings();

  useEffect(() => {
    const fetchMarkets = async () => {
      if (isConnected) {
        setLoading(true);
        try {
          const marketsData = await getMarkets();
          setMarkets(marketsData);
        } catch (error) {
          console.error("Failed to fetch markets:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMarkets();
    // Set up an interval to refresh markets
    const interval = setInterval(fetchMarkets, 30000);
    return () => clearInterval(interval);
  }, [isConnected, getMarkets]);

  const handleTakePosition = (marketId: number, isYesPosition: boolean) => {
    setSelectedMarket(marketId);
    setIsYes(isYesPosition);
    setOpenPositionDialog(true);
  };

  const handleResolve = (marketId: number) => {
    setSelectedMarket(marketId);
    setOpenResolveDialog(true);
  };

  const handleClaim = (marketId: number) => {
    claimWinnings(marketId);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Prediction Markets on Somnia</h1>
        <p className="mb-8">Connect your wallet to get started</p>
        <Button onClick={connect}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Prediction Markets</h1>
        <CreateMarketDialog />
      </div>

      {loading ? (
        <div className="flex justify-center">
          <p>Loading markets...</p>
        </div>
      ) : markets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl">No prediction markets found</p>
          <p className="text-muted-foreground mt-2">Create the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => {
            // This is simplified - you'd need to fetch user positions
            const userPosition: UserPosition = {
              yesAmount: 0n,
              noAmount: 0n,
            };
            
            return (
              <MarketCard
                key={market.id}
                market={market}
                userPosition={userPosition}
                onTakePosition={handleTakePosition}
                onResolve={handleResolve}
                onClaim={handleClaim}
                isCreator={market.creator === address}
              />
            );
          })}
        </div>
      )}

      {selectedMarket !== null && (
        <>
          <TakePositionDialog
            marketId={selectedMarket}
            isYes={isYes}
            open={openPositionDialog}
            onOpenChange={setOpenPositionDialog}
          />
          <ResolveMarketDialog
            marketId={selectedMarket}
            open={openResolveDialog}
            onOpenChange={setOpenResolveDialog}
          />
        </>
      )}
    </div>
  );
}

export default App;
