import React, { useState } from 'react';
import { MarketCard } from '../components/ui/market-card';

const categories = ['All', 'Sports', 'Politics', 'Finance', 'Technology'];

const DashboardPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const trendingMarkets = [
    // Example data
    { id: 1, question: 'Will team A win?', category: 'Sports', endTime: Date.now() + 1000000, totalYesAmount: 500n, totalNoAmount: 300n, resolved: false },
    { id: 2, question: 'Will the stock rise?', category: 'Finance', endTime: Date.now() + 2000000, totalYesAmount: 800n, totalNoAmount: 200n, resolved: false },
    // Add more market data here
  ];

  const filteredMarkets = selectedCategory === 'All'
    ? trendingMarkets
    : trendingMarkets.filter(market => market.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Trending Markets</h1>
      <div className="mb-4">
        {categories.map(category => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === category ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMarkets.map(market => (
          <MarketCard key={market.id} market={market} userPosition={null} onTakePosition={() => {}} onResolve={() => {}} onClaim={() => {}} isCreator={false} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;