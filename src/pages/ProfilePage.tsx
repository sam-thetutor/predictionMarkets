import React, { useState, useEffect } from 'react';
import { useAccount } from '../hooks/useContract';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [totalSOM, setTotalSOM] = useState('0');
  const [analytics, setAnalytics] = useState({
    created: 0,
    participated: 0,
    won: 0,
    lost: 0,
    earned: '0',
  });

  useEffect(() => {
    if (isConnected && address) {
      // Fetch total SOM and analytics data
      const fetchAnalytics = async () => {
        try {
          // Replace with actual logic to fetch total SOM and analytics
          setTotalSOM('1,250.00');
          setAnalytics({
            created: 5,
            participated: 20,
            won: 10,
            lost: 10,
            earned: '500.00',
          });
        } catch (error) {
          console.error('Failed to fetch analytics:', error);
        }
      };

      fetchAnalytics();
    }
  }, [isConnected, address]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4 pb-2">
          <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden">
            {profilePicture ? (
              <img
                src={URL.createObjectURL(profilePicture)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 flex items-center justify-center h-full">
                No Image
              </span>
            )}
          </div>
          <div className="ml-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="mb-2"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        {/* <div className="mb-4">
          <h2 className="text-xl font-semibold">Wallet Address</h2>
          <p className="text-gray-500">{address}</p>
        </div> */}
        {/* <div className="mb-4">
          <h2 className="text-xl font-semibold">Total SOM</h2>
          <p className="text-gray-500">{totalSOM} SOM</p>
        </div>
        */}
       
        <div>
         
          
          <div className="grid border-t-1 pt-4 grid-cols-1  text-white md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold">Campaigns Created</h3>
              <p className="text-gray-500">{analytics.created}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold">Campaigns Participated</h3>
              <p className="text-gray-500">{analytics.participated}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold">Campaigns Won</h3>
              <p className="text-gray-500">{analytics.won}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold">Campaigns Lost</h3>
              <p className="text-gray-500">{analytics.lost}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold">Total Earned</h3>
              <p className="text-gray-500">{analytics.earned} SOM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 