import { useState, useEffect, useCallback } from 'react';
import { useAccount, useMarkets, useClaimWinnings, getUserPositions } from './hooks/useContract';
import type { Market} from './types';
// import { MarketCard } from './components/ui/market-card';
import { CreateMarketDialog } from './components/create-market-dialog';
import { TakePositionDialog } from './components/take-position-dialog';
import { ResolveMarketDialog } from './components/resolve-market-dialog';
import { Button } from './components/ui/button';
import { LogOut, Copy, Wallet, ChevronDown } from 'lucide-react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { UserMarkets } from './pages/UserMarkets';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { UserPositionsSection } from "./components/UserPositionsSection";
import { AllMarketsSection } from "./components/AllMarketsSection";
import  AboutPage  from './pages/AboutPage';
import MarketDetailsPage from './pages/MarketDetailsPage';

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
  const [userPositions, setUserPositions] = useState<Market[]>([]);
  
  const { claimWinnings } = useClaimWinnings();

  const categories = ["All", "Politics", "Sports", "Health", "Science"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");

  const refreshMarkets = useCallback(async () => {
    if (isConnected) {
      setLoading(true);
      try {
        const marketsData = await getMarkets();
        setMarkets(marketsData);
        
        if (address) {
          const positions = await getUserPositions(address);
          setUserPositions(positions);
        }
      } catch (error) {
        console.error("Failed to fetch markets:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [ getMarkets, address]);

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true);
      try {
        const marketsData = await getMarkets();
        setMarkets(marketsData);
      } catch (error) {
        console.error("Failed to fetch markets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 30000);
    return () => clearInterval(interval);
  }, [getMarkets]);

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

  // Add this effect to fetch user positions
  useEffect(() => {
    const fetchUserPositions = async () => {
      if (isConnected && address) {
        try {
          // This would be a function that gets all markets where the user has a position
          const positions = await getUserPositions(address);
          setUserPositions(positions);
        } catch (error) {
          console.error("Failed to fetch user positions:", error);
        }
      }
    };
    
    fetchUserPositions();
  }, [address]);

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

  const navigate = useNavigate();

  const now = Date.now();
  const activeMarkets = markets.filter(
    (m) =>
      !m.resolved &&
      (typeof m.endTime === "bigint"
        ? Number(m.endTime) * 1000 > now
        : new Date(m.endTime).getTime() > now)
  );
  const filteredMarkets = activeMarkets.filter((m) => {
    const matchesCategory =
      selectedCategory === "All" || m.category === selectedCategory;
    const matchesSearch =
      m.question.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-white">
            <Link to="/">PredictSomnia</Link>
          </div>
          <div className="flex-1 flex justify-center">
            <input
              type="text"
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4 mr-4">
              <Link to="/all-markets" className="text-muted-foreground text-white hover:text-foreground">
                All Markets
              </Link>
              <Link to="/my-markets" className="text-muted-foreground text-white hover:text-foreground">
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
                  <div className="text-sm text-gray-500 truncate">
                    
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
                  <div className="text-sm text-gray-500">
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

      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-2 flex gap-2 overflow-x-auto justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium transition
                ${selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground hover:bg-primary/10"}
              `}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Routes>
        <Route
          path="/"
          element={
            <div className="container mx-auto px-4 py-8">
              <AllMarketsSection
                markets={filteredMarkets}
                onTakePosition={handleTakePosition}
                onResolve={handleResolve}
                onClaim={handleClaim}
                address={address}
              />
            </div>
          }
        />
        
        <Route
          path="/all-markets"
          element={
            <div className="container mx-auto px-4 py-8">
              {/* <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Prediction Markets</h1> */}
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : filteredMarkets.length === 0 ? (
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
                <div className="space-y-8">
                  <UserPositionsSection
                    userPositions={userPositions}
                    onTakePosition={handleTakePosition}
                    onResolve={handleResolve}
                    onClaim={handleClaim}
                    address={address}
                  />
                  <AllMarketsSection
                    markets={filteredMarkets}
                    onTakePosition={handleTakePosition}
                    onResolve={handleResolve}
                    onClaim={handleClaim}
                    address={address}
                  />
                </div>
              )}
            </div>
          }
        />
        
        <Route
          path="/my-markets"
          element={
            <UserMarkets
              address={address}
              onTakePosition={handleTakePosition}
              onResolve={handleResolve}
              onClaim={handleClaim}
            />
          }
        />
        
        <Route path="/market/:id" element={<MarketDetailsPage />} />
        
        <Route path="/about" element={<AboutPage />} />
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
