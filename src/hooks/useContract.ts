import { useCallback, useState, useEffect } from 'react';
import { parseEther } from 'viem';
import { PREDICTION_MARKET_ADDRESS, getWalletClient, publicClient } from '../lib/web3';
import type { Market } from '../types';
import ABI from '../../contracts/contract.json';

// At the top of your file, outside the hook
export async function fetchMarkets(): Promise<Market[]> {
  try {
    const count = await publicClient.readContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: ABI,
      functionName: 'getMarketCount',
    });
    const marketCount = Number(count);
    if (marketCount === 0) return [];
    const markets: Market[] = [];
    for (let i = 0; i < marketCount; i++) {
      let market:any = await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: ABI,
        functionName: 'getMarket',
        args: [i],
      });
      const marketObject = {
        id: i,
        question: market[0],
        description: market[1],
        category: market[2],
        endTime: market[3],
        resolved: market[4],
        outcome: market[5],
        creator: market[6],
        totalYesAmount: market[7],
        totalNoAmount: market[8],
      };
      markets.push(marketObject);
    }
    return markets;
  } catch (err) {
    console.error("Failed to fetch markets", err);
    return [];
  }
}

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
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchMarkets();
      setMarkets(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { markets, isLoading, error, refresh };
}

export function useCreateMarket() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Now accepts: question, description, category, endDate
  const createMarket = async (
    question: string,
    description: string,
    category: string,
    endDate: Date
  ) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    try {
      if (!endDate || isNaN(endDate.getTime())) {
        throw new Error("Invalid end date");
      }
      const endTime = Math.floor(endDate.getTime() / 1000);
      if (!endTime || isNaN(endTime)) {
        throw new Error("Invalid end time");
      }
      const walletClient = await getWalletClient();
      const [address] = await walletClient.getAddresses();
      console.log("Creating market with:", { question, description, category, endTime });
      const  results  = await walletClient.writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: ABI,
        functionName: 'createMarket',
        args: [question, description, category, BigInt(endTime)],
        account: address as `0x${string}`,
      });
      console.log("results :", results)
      await publicClient.waitForTransactionReceipt({ hash: results });
      setIsSuccess(true);
      console.log("Market created successfully");
    } catch (err) {
      console.error("Failed to create market", err);
      setError(new Error("Error creating market. Try again later"));
    } finally {
      setIsLoading(false);
    }
  };
  
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
      let [address] = await walletClient.getAddresses();
      
      const  hash  = await walletClient.writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: ABI,
        functionName: 'resolveMarket',
        args: [BigInt(marketId), outcome],
        account: address as `0x${string}`
      });
      
      await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
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
      let [address] = await walletClient.getAddresses();
      
      const  hash  = await walletClient.writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: ABI,
        functionName: 'claimWinnings',
        args: [BigInt(marketId)],
        account: address as `0x${string}`
      });
      
      await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
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

export async function getUserPositions(userAddress: string): Promise<Market[]> {
  try {
    const allMarkets = await fetchMarkets();
    if (!Array.isArray(allMarkets)) {
      console.error("fetchMarkets did not return an array:", allMarkets);
      return [];
    }
    const marketsWithPositions: Market[] = [];
    
    console.log("allMarkets :", allMarkets)
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