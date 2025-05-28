import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, BarChart, Trophy, Wallet, User, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`fixed top-0 left-0 h-full ${isCollapsed ? 'w-16' : 'w-64'} bg-[var(--sidebar-color)] text-white shadow-lg transition-width duration-300 z-10`}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:text-[var(--accent-color)]">
            <h4 className={`text-2xl font-bold mb-6 ${isCollapsed ? 'hidden' : 'block'}`}>Predai</h4>
          </Link>
          <button onClick={toggleSidebar} className="mb-6 self-end">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav className="flex flex-col space-y-6 mt-8">
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-[var(--accent-color)]">
            <Home size={20} />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
          <Link to="/ai-predictions" className="flex items-center gap-2 hover:text-[var(--accent-color)]">
            <BarChart size={20} />
            {!isCollapsed && <span>AI Predictions</span>}
          </Link>
          <Link to="/challenges" className="flex items-center gap-2 hover:text-[var(--accent-color)]">
            <Trophy size={20} />
            {!isCollapsed && <span>Challenges</span>}
          </Link>
          <Link to="/my-pools" className="flex items-center gap-2 hover:text-[var(--accent-color)]">
            <BarChart size={20} />
            {!isCollapsed && <span>My Pools</span>}
          </Link>
          <Link to="/leaderboard" className="flex items-center gap-2 hover:text-[var(--accent-color)]">
            <Trophy size={20} />
            {!isCollapsed && <span>Leaderboard</span>}
          </Link>
          <Link to="/my-wallet" className="flex items-center gap-2 hover:text-[var(--accent-color)]">
            <Wallet size={20} />
            {!isCollapsed && <span>My Wallet</span>}
          </Link>
          <Link to="/profile" className="flex items-center gap-2 hover:text-[var(--accent-color)]">
            <User size={20} />
            {!isCollapsed && <span>Profile</span>}
          </Link>
          <Link to="/support" className="flex items-center gap-2 hover:text-[var(--accent-color)]">
            <HelpCircle size={20} />
            {!isCollapsed && <span>Support</span>}
          </Link>
        </nav>
      </div>
    </aside>
  );
};