import { motion } from 'framer-motion';

const baseCardStyle = {
  background: 'var(--color-card-gradient)',
  border: '1px solid var(--color-card-border)',
  boxShadow: 'var(--color-card-shadow)'
};

const SkeletonBlock = ({ className, style }) => (
  <div 
    className={`bg-[#1A2C56] shimmer-block rounded-lg ${className}`} 
    style={{ ...style, overflow: 'hidden', position: 'relative' }} 
  />
);

const DashboardSkeleton = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 lg:gap-6 w-full min-w-0"
    >
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-block::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.04) 20%,
            rgba(255, 255, 255, 0.08) 60%,
            rgba(255, 255, 255, 0)
          );
          animation: shimmer 2s infinite ease-in-out;
        }
      `}</style>
      {/* Welcome Card Skeleton */}
      <motion.div variants={itemVariants} className="rounded-2xl p-4 sm:p-5 lg:p-6 flex items-center justify-between min-h-[88px]" style={baseCardStyle}>
        <div className="space-y-2">
          <SkeletonBlock className="w-64 h-8 rounded-lg" />
          <SkeletonBlock className="w-48 h-4 rounded-md" />
        </div>
        <SkeletonBlock className="w-24 h-8 rounded-xl" />
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 w-full min-w-0">
        {[...Array(4)].map((_, i) => (
          <motion.div key={i} variants={itemVariants} className="rounded-2xl relative group overflow-hidden" style={{ ...baseCardStyle, minHeight: '130px' }}>
            <div className="p-4 sm:p-5 lg:p-6 flex flex-col justify-between h-full min-h-[130px]">
              <div className="flex items-center justify-between mb-4">
                <SkeletonBlock className="w-10 h-10 rounded-full" />
                <SkeletonBlock className="w-12 h-5 rounded-md" />
              </div>
              <div>
                <SkeletonBlock className="w-24 h-8 rounded-lg mb-2" />
                <SkeletonBlock className="w-16 h-4 rounded-md" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.8fr)] gap-5 lg:gap-6 w-full min-w-0">
        
        {/* Health Skeleton */}
        <motion.div variants={itemVariants} className="rounded-2xl p-5 lg:p-6 flex flex-col justify-between min-h-[290px]" style={baseCardStyle}>
          <SkeletonBlock className="w-32 h-6 rounded-lg mb-6" />
          <div className="flex items-center gap-6 mb-6">
            <SkeletonBlock className="w-24 h-24 rounded-full" />
            <div className="space-y-2">
              <SkeletonBlock className="w-20 h-6 rounded-lg" />
              <SkeletonBlock className="w-16 h-4 rounded-md" />
            </div>
          </div>
          <SkeletonBlock className="w-full h-4 rounded-md mb-2" />
          <SkeletonBlock className="w-3/4 h-4 rounded-md" />
        </motion.div>

        {/* Chart Skeleton */}
        <motion.div variants={itemVariants} className="rounded-2xl p-5 lg:p-6 flex flex-col min-h-[290px]" style={baseCardStyle}>
          <div className="flex justify-between items-center mb-6">
            <SkeletonBlock className="w-40 h-6 rounded-lg" />
            <SkeletonBlock className="w-16 h-4 rounded-md" />
          </div>
          <div className="flex-1 flex items-end gap-3 justify-between px-4 pb-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex gap-1 items-end h-full w-full justify-center">
                <SkeletonBlock className="w-full max-w-[28px]" style={{ height: `${Math.max(20, Math.random() * 80 + 20)}%` }} />
                <SkeletonBlock className="w-full max-w-[28px]" style={{ height: `${Math.max(20, Math.random() * 80 + 20)}%` }} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 lg:gap-6 w-full min-w-0">
        
        {/* Categories Skeleton */}
        <motion.div variants={itemVariants} className="rounded-2xl p-5 lg:p-6" style={{ ...baseCardStyle, minHeight: '220px' }}>
          <div className="flex justify-between items-center mb-6">
            <SkeletonBlock className="w-32 h-6 rounded-lg" />
            <SkeletonBlock className="w-16 h-4 rounded-md" />
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <SkeletonBlock className="w-24 h-4 rounded-md" />
                  <SkeletonBlock className="w-16 h-4 rounded-md" />
                </div>
                <SkeletonBlock className="w-full h-1.5 rounded-full" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Insights Skeleton */}
        <motion.div variants={itemVariants} className="rounded-2xl p-5 lg:p-6" style={{ ...baseCardStyle, minHeight: '220px' }}>
          <SkeletonBlock className="w-32 h-6 rounded-lg mb-6" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 items-start p-3.5 rounded-[16px] bg-white/5 border border-white/5">
                <SkeletonBlock className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <SkeletonBlock className="w-full h-3 rounded-md" />
                  <SkeletonBlock className="w-4/5 h-3 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default DashboardSkeleton;
