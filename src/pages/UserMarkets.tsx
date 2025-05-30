import { useState, useEffect } from 'react';
import { useMarkets } from '../hooks/useContract';
import { MarketCard } from '../components/ui/market-card';
import { CreateMarketDialog } from '../components/create-market-dialog';
import type { Market, UserPosition } from '../types';

interface UserMarketsProps {
  address: string | null;
  onTakePosition: (marketId: number, isYes: boolean) => void;
  onResolve: (marketId: number) => void;
  onClaim: (marketId: number) => void;
}

export function UserMarkets({ address, onTakePosition, onResolve, onClaim }: UserMarketsProps) {
  const { markets } = useMarkets();
  const [userMarkets, setUserMarkets] = useState<Market[]>([]);
  const [activeMarkets, setActiveMarkets] = useState<Market[]>([]);
  const [inactiveMarkets, setInactiveMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserMarkets = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const allMarkets = markets;
      const userCreatedMarkets = allMarkets.filter((market: Market) => 
        market.creator.toLowerCase() === address.toLowerCase()
      );
      
      setUserMarkets(userCreatedMarkets);
      
      // Split markets into active and inactive
      const now = Date.now();
      const active = userCreatedMarkets.filter((market: Market) => 
        !market.resolved && Number(market.endTime) * 1000 > now
      );
      const inactive = userCreatedMarkets.filter((market: Market) => 
        market.resolved || Number(market.endTime) * 1000 <= now
      );
      
      setActiveMarkets(active);
      setInactiveMarkets(inactive);
    } catch (error) {
      console.error("Failed to fetch user markets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMarkets();
  }, [address]);

  // Create a dummy user position (you'd need to implement actual position fetching)
  const userPosition: UserPosition = {
    yesAmount: 0n,
    noAmount: 0n,
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Markets</h1>
        <CreateMarketDialog onMarketCreated={fetchUserMarkets} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : userMarkets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">You haven't created any markets yet</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Create your first prediction market!</p>
          <div className="mt-6">
            <CreateMarketDialog onMarketCreated={fetchUserMarkets} />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {activeMarkets.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Active Markets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeMarkets.map((market) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    userPosition={userPosition}
                    onTakePosition={onTakePosition}
                    onResolve={onResolve}
                    onClaim={onClaim}
                    isCreator={true}
                  />
                ))}
              </div>
            </div>
          )}
          
          {inactiveMarkets.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Inactive Markets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveMarkets.map((market) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    userPosition={userPosition}
                    onTakePosition={onTakePosition}
                    onResolve={onResolve}
                    onClaim={onClaim}
                    isCreator={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
} 