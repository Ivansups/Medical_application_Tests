'use client';

import { useState, useEffect } from 'react';

interface Stat {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface UserStatsProps {
  stats: Stat[];
}

export default function UserStats({ stats }: UserStatsProps) {
  const [progressValues, setProgressValues] = useState<number[]>([]);

  useEffect(() => {
    // Генерируем случайные значения только на клиенте
    const values = stats.map(() => Math.floor(Math.random() * 100));
    setProgressValues(values);
  }, [stats.length]);

  return (
    <div className="dashboard-card mb-8">
             <h2 className="text-2xl font-bold text-black mb-6" style={{color: '#000000'}}>Ваша статистика</h2>
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <i className={`${stat.icon} text-3xl ${stat.color}`}></i>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-arrow-up text-blue-600 text-xs"></i>
              </div>
            </div>
                         <h3 className="text-2xl font-bold text-black mb-2" style={{color: '#000000'}}>{stat.value}</h3>
             <p className="text-black text-sm" style={{color: '#000000'}}>{stat.title}</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-500"
                style={{ width: progressValues[index] ? `${progressValues[index]}%` : '0%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

