import { Plus } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  message, 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in w-full h-full min-h-[300px]">
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-full blur-2xl group-hover:bg-[var(--color-primary)]/20 transition-all duration-500"></div>
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center relative z-10 border border-white/5 shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', backdropFilter: 'blur(10px)' }}>
          {Icon && <Icon className="w-10 h-10 text-[var(--color-primary)] opacity-80" style={{ filter: 'drop-shadow(0 0 10px var(--color-primary-glow))' }} />}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm font-medium max-w-sm mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {message}
      </p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:opacity-90 hover:-translate-y-1 shadow-[0_0_20px_var(--color-primary-glow)] group"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
