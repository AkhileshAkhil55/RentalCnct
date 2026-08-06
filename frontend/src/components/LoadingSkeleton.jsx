import React from 'react';

// Single Product Card Loader Skeleton
export const CardSkeleton = () => {
  return (
    <div className="border border-slate-200/50 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-sm h-[350px] w-full bg-white/40 dark:bg-slate-900/30 p-4 flex flex-col justify-between animate-pulse">
      <div>
        <div className="h-40 w-full rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-800"></div>
          <div className="h-3 w-8 rounded bg-slate-200 dark:bg-slate-800"></div>
        </div>
        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800 mt-3"></div>
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800 mt-2"></div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3 mt-3 flex justify-between items-center">
        <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-800"></div>
      </div>
    </div>
  );
};

// Grid of Skeletons
export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

// Details Page Loader Skeleton
export const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Images */}
        <div className="lg:col-span-7 space-y-4">
          <div className="h-[400px] w-full rounded-3xl bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex gap-2">
            <div className="h-16 w-20 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-16 w-20 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-16 w-20 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
          </div>
        </div>

        {/* Right: details */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-8 w-full rounded bg-slate-200 dark:bg-slate-800 mt-3"></div>
            <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800 mt-2"></div>
          </div>
          
          <div className="p-6 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl bg-white/40 dark:bg-slate-900/30 space-y-4">
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-8 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
          </div>

          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800"></div>
          </div>
        </div>

      </div>
    </div>
  );
};
