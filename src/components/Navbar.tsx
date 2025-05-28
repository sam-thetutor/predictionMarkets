import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Copy, Wallet, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAccount } from '../hooks/useContract';

interface NavbarProps {
  balance: string;
  copied: boolean;
  copyToClipboard: () => void;
  disconnect: () => void;
  refreshMarkets: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  balance,
  copied,
  copyToClipboard,
  disconnect,
  refreshMarkets,
}) => {
  const { address, isConnected } = useAccount();

  return (
    <header className="bg-[var(--background-color)] shadow w-full">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex-1 flex justify-center">
          <input
            type="text"
            placeholder="Search markets..."
            className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          />
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-4 mr-4">
            <Link to="/all-markets" className="text-white hover:text-[var(--accent-color)]">
              All Markets
            </Link>
            <Link to="/my-markets" className="text-white hover:text-[var(--accent-color)]">
              My Markets
            </Link>
          </nav>
          {isConnected && (
            <Button onClick={refreshMarkets} className="bg-gray-800 text-white border cursor-pointer border-gray-700">
              Create
            </Button>
          )}
          
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
        </div>
      </div>
    </header>
  );
};