import { createPublicClient, http, createWalletClient, custom } from "viem";
import { ethers } from "ethers";
import {somniaTestnet} from "viem/chains"

// Configure Somnia network
export const somnia = {
  id: 2332, // Replace with actual Somnia chain ID
  name: 'Somnia',
  network: 'somnia',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia',
    symbol: 'SOM',
  },
  rpcUrls: {
    // Add multiple RPC URLs for better reliability
    default: { 
      http: [
        'https://dream-rpc.somnia.network/',
      ] 
    },
  },
  blockExplorers: {
    default: { name: 'SomniaExplorer', url: 'https://dream-rpc.somnia.network' }, // Replace with actual explorer URL
  },
};

// Create a public client for reading from the blockchain with retry logic
export const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(),
  batch: {
    multicall: true,
  },
  pollingInterval: 4000,
});

// Function to get a wallet client when needed
export const getWalletClient = async () => {
  if (!window.ethereum) throw new Error("No ethereum provider found");
  
  return createWalletClient({
    chain: somniaTestnet,
    transport: custom(window.ethereum)
  });
};

// Function to get ethers provider and signer
export const getEthersProvider = () => {
  if (!window.ethereum) throw new Error("No ethereum provider found");

  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getEthersSigner = async () => {
  const provider = getEthersProvider();
  return provider.getSigner();
};

export const PREDICTION_MARKET_ADDRESS = '0x1fb54A455faFe7517D75Dd4B526E0dB37c7758BE'; // Replace with your deployed contract address 