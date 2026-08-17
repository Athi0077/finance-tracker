import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 w-full">
      <style>{`
        .premium-spinner {
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: var(--color-primary);
          border-right-color: var(--color-primary);
          animation: spin 1s linear infinite;
          filter: drop-shadow(0 0 8px rgba(249,115,22,0.5));
          position: relative;
        }
        .premium-spinner::before {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-left-color: var(--color-accent);
          border-bottom-color: var(--color-accent);
          animation: spin 0.5s linear infinite reverse;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className={`${sizes[size]} premium-spinner`} />
      {text && (
        <p className="text-[13px] font-bold tracking-wide animate-pulse" style={{ color: 'var(--color-primary)', textShadow: '0 0 10px rgba(249,115,22,0.3)' }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
