'use client';

import React from 'react';

interface ChartDataItem {
  label: string;
  value: number;
  color?: string; // Optional custom HSL/CSS color
}

// 1. PURE SVG DONUT CHART
export const DonutChart = ({ data, title }: { data: ChartDataItem[]; title?: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Define default sleek colors
  const defaultColors = [
    'stroke-purple-500',
    'stroke-indigo-500',
    'stroke-sky-500',
    'stroke-emerald-500',
    'stroke-amber-500',
  ];

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {title && <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>}
      
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r="40" className="stroke-slate-900 fill-transparent" strokeWidth="8" />
          
          {total > 0 && data.map((item, idx) => {
            const percent = (item.value / total) * 100;
            const dashArray = `${percent} ${100 - percent}`;
            const dashOffset = -accumulatedPercent;
            accumulatedPercent += percent;

            const strokeColor = item.color || defaultColors[idx % defaultColors.length];

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r="40"
                className={`fill-transparent transition-all duration-500 ${strokeColor}`}
                strokeWidth="10"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                pathLength="100"
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-2xl font-black text-white">{total.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-xs">
        {data.map((item, idx) => {
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
          const badgeColor = item.color ? item.color.replace('stroke-', 'bg-') : defaultColors[idx % defaultColors.length].replace('stroke-', 'bg-');
          
          return (
            <div key={idx} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${badgeColor} flex-shrink-0`} />
              <span className="text-slate-400 truncate font-medium">{item.label}:</span>
              <span className="text-white font-bold ml-auto">{item.value} ({percent}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2. PURE SVG BAR CHART (BUDGETS OR COUNTS COMPARISON)
export const BarChart = ({ data, height = 180 }: { data: ChartDataItem[]; height?: number }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-end justify-between gap-3 w-full" style={{ height: `${height}px` }}>
        {data.map((item, idx) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              {/* Tooltip value */}
              <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-purple-400 transition-opacity bg-slate-900 border border-slate-800/80 px-1.5 py-0.5 rounded-lg mb-1 shadow-md">
                {item.value.toLocaleString()}
              </span>

              {/* SVG vertical column bar */}
              <div className="w-full max-w-[28px] bg-slate-900 rounded-lg overflow-hidden flex flex-col justify-end" style={{ height: `${heightPercent}%` }}>
                <div className="w-full h-full bg-gradient-to-t from-indigo-600 via-purple-500 to-sky-400 rounded-lg transition-all duration-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis X Labels */}
      <div className="flex justify-between gap-3 border-t border-slate-850 pt-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 truncate max-w-[50px]" title={item.label}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};
