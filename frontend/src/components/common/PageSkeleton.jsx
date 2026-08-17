import React from 'react';

const PageSkeleton = () => {
  return (
    <div className="space-y-6 w-full animate-fade-in p-6 pt-0">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse"></div>
          <div className="h-4 w-64 bg-white/5 rounded-md animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-white/10 rounded-xl animate-pulse"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 h-48 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-12 w-12 rounded-full bg-white/10 animate-pulse"></div>
              <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-1/3 bg-white/10 rounded animate-pulse"></div>
              <div className="h-8 w-1/2 bg-white/10 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton;
