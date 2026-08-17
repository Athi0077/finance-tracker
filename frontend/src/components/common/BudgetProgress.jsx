import { formatCurrency, getProgressColor, getBudgetStatus } from '../../lib/utils';

const BudgetProgress = ({ spent, budget, showLabel = true, size = 'md' }) => {
  const percentage = budget > 0 ? Math.round((spent / budget) * 1000) / 10 : 0;
  const cappedPercentage = Math.min(percentage, 100);
  const status = getBudgetStatus(percentage);
  const progressColorClass = getProgressColor(percentage);

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {formatCurrency(spent)} / {formatCurrency(budget)}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: status.color }}
          >
            {percentage}%
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div
        className={`w-full rounded-full overflow-hidden relative z-10 ${heights[size]}`}
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ease-out ${progressColorClass} relative`}
          style={{ 
            width: `${cappedPercentage}%`,
            boxShadow: `0 0 10px ${status.color}`,
          }}
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full rounded-full"></div>
        </div>
      </div>

      {/* Status label */}
      {showLabel && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-xs">{status.emoji}</span>
          <span className="text-xs font-medium" style={{ color: status.color }}>
            {percentage > 100
              ? `Overspent by ${formatCurrency(spent - budget)}`
              : percentage >= 90
                ? `Only ${formatCurrency(budget - spent)} remaining`
                : status.label
            }
          </span>
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
