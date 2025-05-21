import { useCallback, useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import { ethers } from 'ethers';
import { PREDICTION_MARKET_ADDRESS, getEthersSigner, publicClient } from '../lib/web3';
import type { Market, UserPosition } from '../types';

// ABI for the contract (simplified for brevity)
const ABI = [
  // Add your contract ABI here
];

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

  return { address, isConnected, connect };
}

export function useMarkets() {
  const [marketCount, setMarketCount] = useState(0);
  
  useEffect(() => {
    const fetchMarketCount = async () => {
      try {
        const count = await publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS,
          abi: ABI,
          functionName: 'getMarketCount',
        });
        setMarketCount(Number(count));
      } catch (error) {
        console.error("Failed to fetch market count", error);
      }
    };
    
    fetchMarketCount();
  }, []);

  const getMarkets = useCallback(async () => {
    if (marketCount === 0) return [];
    
    const markets: Market[] = [];
    for (let i = 0; i < marketCount; i++) {
      // Fetch each market
      // This is simplified - you'd need to implement proper fetching logic
    }
    
    return markets;
  }, [marketCount]);

  return { marketCount, getMarkets };
}

export function useCreateMarket() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createMarket = useCallback(async (question: string, endTime: Date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const signer = await getEthersSigner();
      const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, ABI, signer);
      
      const tx = await contract.createMarket(
        question, 
        Math.floor(endTime.getTime() / 1000)
      );
      
      await tx.wait();
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to create market", err);
      setError(err instanceof Error ? err : new Error(String(err)));
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
      const signer = await getEthersSigner();
      const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, ABI, signer);
      
      const tx = await contract.takePosition(
        marketId,
        isYes,
        { value: ethers.parseEther(amount) }
      );
      
      await tx.wait();
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
      const signer = await getEthersSigner();
      const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, ABI, signer);
      
      const tx = await contract.resolveMarket(marketId, outcome);
      await tx.wait();
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
      const signer = await getEthersSigner();
      const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, ABI, signer);
      
      const tx = await contract.claimWinnings(marketId);
      await tx.wait();
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