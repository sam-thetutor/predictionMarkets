import { useCallback, useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import { PREDICTION_MARKET_ADDRESS, getWalletClient, publicClient } from '../lib/web3';
import type { Market, UserPosition } from '../types';
import ABI from '../../contracts/contract.json';


// Custom hook for account connection
export function useAccount() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          console.error("Failed to get accounts", error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress(null);
          setIsConnected(false);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Ethereum wallet");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error("User rejected connection", error);
    }
  };

  const disconnect = () => {
    // Note: There's no standard way to disconnect in Web3
    // We're just clearing our local state
    setAddress(null);
    setIsConnected(false);
  };

  return { address, isConnected, connect, disconnect };
}

export function useMarkets() {
  const [marketCount, setMarketCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchMarketCount = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const count = await publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS,
          abi: ABI,
          functionName: 'getMarketCount',
        });
        console.log("Number of prediction markets:", count);
        setMarketCount(Number(count));
      } catch (err) {
        console.error("Failed to fetch market count", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // If we can't connect to the blockchain, set a default state
        setMarketCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMarketCount();
  }, []);

  const getMarkets = useCallback(async () => {
    if (marketCount === 0) return [];
    
    try {
      const markets: Market[] = [];
      for (let i = 0; i < marketCount; i++) {
        // Fetch each market usng the public client from viem

        let market  = await publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS,
          abi: ABI,
          functionName: 'getMarket',
          args:[Number(i)]
        })
        //convert the market to a Market object
        const marketObject = {
          id: i,
          question: market[0],
          endTime: market[1],
          resolved: market[2],
          outcome: market[3],
          creator: market[4],
          totalYesAmount: market[5],
          totalNoAmount: market[6]
        }
        markets.push(marketObject)
      }
      return markets;
    } catch (err) {
      console.error("Failed to fetch markets", err);
      return [];
    }
  }, [marketCount]);

  return { marketCount, getMarkets, isLoading, error };
}

export function useCreateMarket() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createMarket = useCallback(async (question: string, endTime: Date, e?: React.FormEvent) => {
    if (e) {
      e.preventDefault(); // Prevent form submission
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const walletClient = await getWalletClient();
      
      //get the account from the wallet client
      let [address] = await walletClient.getAddresses();

      const hash = await walletClient.writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: ABI,
        functionName: 'createMarket',
        args: [question, BigInt(Math.floor(endTime.getTime() / 1000))],
        account: address as `0x${string}`
      });
      
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction receipt:", receipt);
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to create market", err);
      setError(new Error("Error creating market. Try again later"));
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { createMarket, isLoading, isSuccess, error };
}

export function useTakePosition() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const takePosition = useCallback(async (marketId: number, isYes: boolean, amount: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const walletClient = await getWalletClient();

      let [address] = await walletClient.getAddresses();
      
      const  hash  = await walletClient.writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: ABI,
        functionName: 'takePosition',
        args: [BigInt(marketId), isYes],
        value: parseEther(amount),
        account: address as `0x${string}`
      });

      console.log("hash :",hash)
      let receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction receipt:", receipt);
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to take position", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { takePosition, isLoading, isSuccess, error };
}

export function useResolveMarket() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const resolveMarket = useCallback(async (marketId: number, outcome: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const walletClient = await getWalletClient();
      
      const { hash } = await walletClient.writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: ABI,
        functionName: 'resolveMarket',
        args: [BigInt(marketId), outcome]
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to resolve market", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { resolveMarket, isLoading, isSuccess, error };
}

export function useClaimWinnings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const claimWinnings = useCallback(async (marketId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const walletClient = await getWalletClient();
      
      const { hash } = await walletClient.writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: ABI,
        functionName: 'claimWinnings',
        args: [BigInt(marketId)]
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to claim winnings", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { claimWinnings, isLoading, isSuccess, error };
}


const getMarkets = async () => {
  const markets = await publicClient.readContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: ABI,
    functionName: 'getMarketCount'
  })
  return markets
}


export async function getUserPositions(userAddress: string): Promise<Market[]> {
  try {
    // First get all markets
    const allMarkets = await getMarkets();
    const marketsWithPositions: Market[] = [];
    
    // For each market, check if the user has a position
    for (const market of allMarkets) {
      try {
        const userPosition = await publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS,
          abi: ABI,
          functionName: 'getUserPosition',
          args: [BigInt(market.id), userAddress]
        }) as [bigint, bigint]; // [yesAmount, noAmount]
        
        const yesAmount = userPosition[0];
        const noAmount = userPosition[1];
        
        // If user has a position in this market, add it to the result
        if (yesAmount > 0n || noAmount > 0n) {
          marketsWithPositions.push({
            ...market,
            userYesAmount: yesAmount,
            userNoAmount: noAmount
          });
        }
      } catch (error) {
        console.error(`Failed to get user position for market ${market.id}:`, error);
      }
    }
    
    return marketsWithPositions;
  } catch (error) {
    console.error("Failed to get user positions:", error);
    return [];
  }
} 