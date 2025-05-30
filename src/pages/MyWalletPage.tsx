import React from 'react';
import { useAccount } from '../hooks/useContract';

const MyWalletPage: React.FC = () => {
  const { address, isConnected } = useAccount();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wallet</h1>
      {isConnected ? (
        <div className="bg-[var(--sidebar-color)] text-white p-4 rounded-lg">
          <h2 className="text-xl font-semibold">Wallet Address</h2>
          <p className="mt-2">{address}</p>
        </div>
      ) : (
        <p>Please connect your wallet to view the address.</p>
      )}
    </div>
  );
};

export default MyWalletPage;