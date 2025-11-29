import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { ProcessingStats } from '../types';

interface ChartsProps {
  stats: ProcessingStats;
}

export const ResultCharts: React.FC<ChartsProps> = ({ stats }) => {
  const pieData = [
    { name: 'New Size', value: stats.compressedTotal, color: '#3b82f6' },
    { name: 'Saved Space', value: stats.originalTotal - stats.compressedTotal, color: '#e2e8f0' },
  ];

  const barData = [
    {
      name: 'Size Comparison',
      Original: (stats.originalTotal / 1024 / 1024).toFixed(2),
      Compressed: (stats.compressedTotal / 1024 / 1024).toFixed(2),
    }
  ];

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
      {/* Space Distribution */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
           Space Optimization
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ReTooltip formatter={(value: number) => formatSize(value)} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-2">
          <span className="text-3xl font-bold text-blue-600">
            {stats.percentageSaved.toFixed(0)}%
          </span>
          <p className="text-slate-500 text-sm">Smaller</p>
        </div>
      </div>

      {/* Before/After Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Size Comparison (MB)</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis />
              <ReTooltip />
              <Legend />
              <Bar dataKey="Original" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={60} />
              <Bar dataKey="Compressed" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-2 flex gap-8">
           <div>
             <p className="text-slate-400 text-xs uppercase font-semibold">Before</p>
             <p className="text-lg font-medium text-slate-600">{formatSize(stats.originalTotal)}</p>
           </div>
           <div>
             <p className="text-blue-400 text-xs uppercase font-semibold">After</p>
             <p className="text-lg font-bold text-blue-600">{formatSize(stats.compressedTotal)}</p>
           </div>
        </div>
      </div>
    </div>
  );
};