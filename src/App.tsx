import { useState, useEffect, useCallback } from 'react';
import { useAccount, useMarkets, useTakePosition, useClaimWinnings } from './hooks/useContract';
import type { Market, UserPosition } from './types';
import { MarketCard } from './components/ui/market-card';
import { CreateMarketDialog } from './components/create-market-dialog';
import { TakePositionDialog } from './components/take-position-dialog';
import { ResolveMarketDialog } from './components/resolve-market-dialog';
import { Button } from './components/ui/button';
import { LogOut, Copy, Wallet, ChevronDown } from 'lucide-react';
import { Routes, Route, Link } from 'react-router-dom';
import { UserMarkets } from './pages/UserMarkets';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";

function App() {
  const { address, isConnected, connect, disconnect } = useAccount();
  const { getMarkets } = useMarkets();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [isYes, setIsYes] = useState(false);
  const [openPositionDialog, setOpenPositionDialog] = useState(false);
  const [openResolveDialog, setOpenResolveDialog] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [copied, setCopied] = useState(false);
  
  const { claimWinnings } = useClaimWinnings();

  const refreshMarkets = useCallback(async () => {
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
  }, [isConnected, getMarkets]);

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
    const interval = setInterval(fetchMarkets, 30000);
    return () => clearInterval(interval);
  }, [isConnected, getMarkets]);

  // Fetch user balance (simplified)
  useEffect(() => {
    if (isConnected && address) {
      // This is a placeholder - you would need to implement actual balance fetching
      const fetchBalance = async () => {
        try {
          // Replace with actual balance fetching logic
          setBalance("1,250.00");
        } catch (error) {
          console.error("Failed to fetch balance:", error);
          setBalance("0");
        }
      };
      
      fetchBalance();
    }
  }, [isConnected, address]);

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <header className="flex justify-between items-center mb-16">
            <div className="text-2xl font-bold">PredictSomnia</div>
            <Button 
              onClick={connect}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Connect Wallet
            </Button>
          </header>
          
          <main className="flex flex-col md:flex-row items-center gap-12 py-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Predict the Future.<br />
                <span className="text-indigo-400">Earn Rewards.</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-md">
                Create and participate in prediction markets on the Somnia blockchain. 
                Bet on outcomes, resolve markets, and claim your winnings.
              </p>
              <div className="pt-4">
                <Button 
                  onClick={connect} 
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6"
                >
                  Get Started
                </Button>
              </div>
              
              <div className="flex gap-8 pt-8 text-gray-400">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-white">100%</span>
                  <span>Decentralized</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-white">0%</span>
                  <span>Platform Fees</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-white">24/7</span>
                  <span>Market Access</span>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 bg-gray-800 p-16 rounded-xl shadow-2xl border border-gray-700">
              {/* <div className="text-xl font-semibold mb-4">Featured Market Example</div> */}
              <div className="bg-gray-700 rounded-lg p-6 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">Will ETH reach $5000 by end of 2024?</h3>
                  <span className="px-2 py-1 bg-gray-600 text-xs rounded-full">Ends in 3 months</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <div className="text-green-400 font-bold">YES</div>
                    <div className="text-sm text-gray-400">65% probability</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <div className="text-red-400 font-bold">NO</div>
                    <div className="text-sm text-gray-400">35% probability</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400 mb-4">Total pool: 1,250 SOM</div>
                <div className="flex gap-2">
                  <Button variant="outline" className="w-1/2" disabled>Bet YES</Button>
                  <Button variant="outline" className="w-1/2" disabled>Bet NO</Button>
                </div>
              </div>
              <div className="text-center text-gray-400 text-sm">
                Connect your wallet to start trading on real markets
              </div>
            </div>
          </main>
          
          <footer className="mt-24 border-t border-gray-800 pt-8 text-gray-400 text-sm">
            <div className="flex justify-between items-center">
              <div>© 2024 PredictSomnia. All rights reserved.</div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white">Terms</a>
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Docs</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            <Link to="/">PredictSomnia</Link>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4 mr-4">
              <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                All Markets
              </Link>
              <Link to="/my-markets" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                My Markets
              </Link>
            </nav>
            
            <DropdownMenu classname="text-white">
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-gray-800 text-white">
                  <Wallet size={16} />
                  <span>Wallet</span>
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 text-white bg-gray-800">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Address</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={copyToClipboard}
                      className="h-8 px-2"
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    
                    {/* displa the shortened address */}
                    {address?.slice(0, 14)}...{address?.slice(-4)}
                  </div>
                  {copied && (
                    <span className="text-xs text-green-500 mt-1">Copied to clipboard!</span>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="px-2 py-2">
                  <div className="text-sm font-medium">Balance</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {balance} SOM
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={disconnect} className="text-red-500 cursor-pointer">
                  <LogOut size={16} className="mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* <CreateMarketDialog onMarketCreated={refreshMarkets} /> */}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={
          <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Prediction Markets</h1>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : markets.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">No prediction markets found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Create the first market to get started!</p>
                <div className="mt-6">
                  <CreateMarketDialog onMarketCreated={refreshMarkets} />
                </div>
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
          </main>
        } />
        
        <Route path="/my-markets" element={
          <UserMarkets 
            address={address} 
            onTakePosition={handleTakePosition}
            onResolve={handleResolve}
            onClaim={handleClaim}
          />
        } />
      </Routes>

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
