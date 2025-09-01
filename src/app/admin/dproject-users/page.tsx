'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  user_id: string;
  referrer_id: string;
  email: string;
  name: string;
  token_id: string;
  plan_a: {
    dateTime?: string;
    POL?: number;
    rateTHBPOL?: number;
  } | null;
  date_time: string;
  pol: number | string | null;
  rate: number | string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0, loading: true });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/dproject-users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats({ ...data, loading: false });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Helper function to safely convert to number and format
  const formatNumber = (value: number | string | null): string => {
    if (value === null || value === undefined) return '0.00';
    
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Helper function to safely calculate total POL
  const calculateTotalPOL = () => {
    const total = users.reduce((sum, user) => {
      const polValue = user.pol;
      if (polValue === null || polValue === undefined) return sum;
      
      const num = typeof polValue === 'string' ? parseFloat(polValue) : polValue;
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
    return total.toFixed(2);
  };

  // Helper function to safely calculate average rate
  const calculateAverageRate = () => {
    const validRates = users
      .map(user => {
        const rateValue = user.rate;
        if (rateValue === null || rateValue === undefined) return null;
        
        const num = typeof rateValue === 'string' ? parseFloat(rateValue) : rateValue;
        return isNaN(num) ? null : num;
      })
      .filter((rate): rate is number => rate !== null);
    
    if (validRates.length === 0) return '0.00';
    
    const total = validRates.reduce((sum, rate) => sum + rate, 0);
    return (total / validRates.length).toFixed(2);
  };

  if (stats.loading || !isClient) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8"><Link href="/">Admin Dashboard</Link></h1>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Active Today</h2>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total POL</h2>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {calculateTotalPOL()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Avg Rate</h2>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {calculateAverageRate()}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">dProject Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-2 text-left">User ID</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Token ID</th>
                <th className="px-4 py-2 text-left">Referrer</th>
                <th className="px-4 py-2 text-left">POL</th>
                <th className="px-4 py-2 text-left">Rate</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 cursor-pointer">
                  <td className="px-4 py-2 font-mono text-sm">{user.user_id}</td>
                  <td className="px-4 py-2">{user.email || 'N/A'}</td>
                  <td className="px-4 py-2">{user.name || 'N/A'}</td>
                  <td className="px-4 py-2">{user.token_id || 'N/A'}</td>
                  <td className="px-4 py-2 font-mono text-sm">
                    {user.referrer_id || 'None'}
                  </td>
                  <td className="px-4 py-2">{formatNumber(user.pol)}</td>
                  <td className="px-4 py-2">{formatNumber(user.rate)}</td>
                  <td className="px-4 py-2">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No users found</p>
        )}
      </div>
    </div>
  );
}