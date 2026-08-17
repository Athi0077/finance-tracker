import React from 'react';

const TableSkeleton = () => {
  return (
    <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden mt-6">
      <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.01]">
        {[...Array(5)].map((_, i) => (
          <div key={`header-${i}`} className="h-4 bg-white/10 rounded-md animate-pulse w-3/4"></div>
        ))}
      </div>
      <div className="flex flex-col">
        {[...Array(8)].map((_, i) => (
          <div key={`row-${i}`} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/5 items-center">
            <div className="h-4 bg-white/10 rounded animate-pulse w-24"></div>
            <div className="h-4 bg-white/10 rounded animate-pulse w-20"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded animate-pulse w-24"></div>
            </div>
            <div className="h-4 bg-white/10 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-white/10 rounded animate-pulse w-16 justify-self-end"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
