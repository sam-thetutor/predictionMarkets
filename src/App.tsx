import { useState, useEffect, useCallback } from 'react';
import { useAccount, useMarkets, useClaimWinnings, getUserPositions, fetchMarkets } from './hooks/useContract';
import type { Market } from './types';
// import { MarketCard } from './components/ui/market-card';
import { CreateMarketDialog } from './components/create-market-dialog';
import { TakePositionDialog } from './components/take-position-dialog';
import { ResolveMarketDialog } from './components/resolve-market-dialog';
import { Button } from './components/ui/button';
import { LogOut, Copy, Wallet, ChevronDown, User } from 'lucide-react';
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
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import AIPredictionsPage from './pages/AIPredictionsPage';
import ChallengesPage from './pages/ChallengesPage';
import MyPoolsPage from './pages/MyPoolsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MyWalletPage from './pages/MyWalletPage';
import SupportPage from './pages/SupportPage';

function App() {
  const { address, isConnected, connect, disconnect } = useAccount();
  const { markets, isLoading, error, refresh } = useMarkets();
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
    setLoading(true);
    try {
      await refresh();
      if (address) {
        const positions = await getUserPositions(address);
        setUserPositions(positions);
      }
    } catch (error) {
      console.error("Failed to fetch markets:", error);
    } finally {
      setLoading(false);
    }
  }, [refresh, address]);

  // useEffect(() => {
  //   async function fetch() {
  //     const data = await fetchMarkets();
  //     setMarkets(data);
  //   }
  //   fetch();
  // }, []);

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
      <Navbar
        balance={balance}
        copied={copied}
        copyToClipboard={copyToClipboard}
        disconnect={disconnect}
        refreshMarkets={refreshMarkets}
      />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/ai-predictions" element={<AIPredictionsPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/my-pools" element={<MyPoolsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/my-wallet" element={<MyWalletPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route
              path="/all-markets"
              element={
                <div className="container mx-auto px-4 py-8">
                  {/* <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Prediction Markets</h1> */}
                  
                  {isLoading ? (
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
            
            <Route path="/profile" element={<ProfilePage />} />
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
      </div>
    </div>
  );
}

export default App;
