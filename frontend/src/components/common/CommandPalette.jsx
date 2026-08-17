import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, PieChart, ArrowLeftRight, Tags, Target, Sparkles, CreditCard, X } from 'lucide-react';

const ACTIONS = [
  { id: 'nav-dashboard', title: 'Go to Dashboard', icon: LayoutDashboard, type: 'navigation', path: '/' },
  { id: 'nav-transactions', title: 'Go to Transactions', icon: ArrowLeftRight, type: 'navigation', path: '/transactions' },
  { id: 'nav-analytics', title: 'Go to Analytics', icon: PieChart, type: 'navigation', path: '/analytics' },
  { id: 'nav-categories', title: 'Go to Categories', icon: Tags, type: 'navigation', path: '/categories' },
  { id: 'nav-goals', title: 'Go to Goals', icon: Target, type: 'navigation', path: '/goals' },
  { id: 'nav-subscriptions', title: 'Go to Subscriptions', icon: CreditCard, type: 'navigation', path: '/subscriptions' },
  { id: 'nav-ai', title: 'Ask AI Advisor', icon: Sparkles, type: 'navigation', path: '/ai-advisor' },
];

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredActions = ACTIONS.filter((action) =>
    action.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleExecute = (action) => {
    if (action.type === 'navigation') {
      navigate(action.path);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        handleExecute(filteredActions[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette Container */}
      <div 
        className="relative w-full max-w-2xl bg-[#0B1022] border border-white/[0.08] rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.6)] overflow-hidden animate-scale-in"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-white/[0.06] bg-[#0A0F20]">
          <Search className="w-5 h-5 text-[#64748B]" />
          <input
            ref={inputRef}
            type="text"
            className="w-full h-14 bg-transparent border-none outline-none text-white px-4 text-lg placeholder:text-[#64748B]"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-white/5 text-[#64748B] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="py-14 text-center text-[#64748B]">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Suggestions
              </div>
              {filteredActions.map((action, index) => {
                const Icon = action.icon;
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={action.id}
                    onClick={() => handleExecute(action)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isSelected 
                        ? 'bg-[#18C99A]/10 text-[#18C99A]' 
                        : 'text-[#CBD5E1] hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[#18C99A]' : 'text-[#64748B]'}`} />
                    <span className="font-medium">{action.title}</span>
                    {isSelected && (
                      <span className="ml-auto text-[10px] text-[#18C99A]/60 font-mono tracking-widest uppercase">
                        Enter to select
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/[0.06] bg-[#050816] flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px]">ESC</kbd>
            <span>to close</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
