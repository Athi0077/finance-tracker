import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Tags,
  ArrowLeftRight,
  User,
  TrendingUp,
  X,
  PieChart,
  Target,
  CreditCard,
  Sparkles,
  Lightbulb,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import logoImg from '../../assets/logo1.png';

const NAV_GROUPS = [
  {
    title: 'MAIN',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/ai-advisor', icon: Sparkles, label: 'AI Advisor' },
      { path: '/insights', icon: Lightbulb, label: 'Insights' },
      { path: '/analytics', icon: PieChart, label: 'Analytics' },
    ]
  },
  {
    title: 'MANAGE',
    items: [
      { path: '/categories', icon: Tags, label: 'Categories' },
      { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
      { path: '/wallets', icon: Users, label: 'Shared Wallets' },
    ]
  },
  {
    title: 'PLAN',
    items: [
      { path: '/goals', icon: Target, label: 'Goals' },
      { path: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { path: '/profile', icon: User, label: 'Profile' },
    ]
  }
];

const Sidebar = ({ isOpen, onClose, isExpanded, setIsExpanded }) => {
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`
          fixed top-0 left-0 z-50 shrink-0
          lg:my-4 lg:ml-4
          flex flex-col overflow-hidden
          transition-transform duration-300 lg:transition-all lg:duration-[350ms]
          ${isOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
        `}
        style={{
          width: window.innerWidth < 1024 ? '280px' : (isExpanded ? '250px' : '72px'),
          height: window.innerWidth < 1024 ? '100vh' : 'calc(100vh - 32px)',
          background: isLight 
            ? 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' 
            : 'linear-gradient(180deg, rgba(16, 38, 83, 0.78), rgba(5, 15, 35, 0.88))',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.10)',
          boxShadow: isLight ? '0 20px 60px rgba(112, 144, 176, 0.12)' : '0 20px 60px rgba(0,0,0,0.35)',
          borderRadius: window.innerWidth < 1024 ? '0px 28px 28px 0px' : '28px',
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      > 
        {/* Subtle orange glow overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-[28px]" style={{ boxShadow: isLight ? 'none' : 'inset 0 0 40px rgba(249,115,22,0.08)' }} />

        {/* Header */}
        <div className="flex items-center h-[72px] px-[18px] shrink-0 relative z-10 w-full whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (window.innerWidth >= 1024 && !isExpanded) setIsExpanded(true); }}
              className={`w-[40px] h-[40px] rounded-[12px] flex items-center justify-center shrink-0 transition-colors ${!isExpanded ? (isLight ? 'hover:bg-slate-100 cursor-pointer' : 'hover:bg-white/10 cursor-pointer') : 'cursor-default'}`}
              style={{ background: 'transparent', border: 'none', padding: 0 }}
              title={!isExpanded ? "Expand Sidebar" : ""}
            >
              <img src={logoImg} alt="FinanceFlow Logo" className="w-[36px] h-[36px] object-contain" />
            </button>
            
            <span 
              className={`text-[18px] font-bold tracking-wide ${isLight ? 'text-[#2B3674]' : 'text-[#F8FAFC]'}`}
              style={{ 
                opacity: isExpanded ? 1 : 0, 
                transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'all 350ms cubic-bezier(0.22, 1, 0.36, 1)',
                transitionDelay: isExpanded ? '50ms' : '0ms'
              }}
            >
              FinanceFlow
            </span>
          </div>

          {/* Toggle Button (Desktop) */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`hidden lg:flex items-center justify-center absolute right-[18px] w-[32px] h-[32px] rounded-full transition-all ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
            style={{ 
              background: isLight ? '#F4F7FE' : 'rgba(255,255,255,0.06)', 
              border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
              opacity: isExpanded ? 1 : 0,
              pointerEvents: isExpanded ? 'auto' : 'none'
            }}
          >
            <ChevronLeft className="w-4 h-4 text-[#94A3B8]" />
          </button>

          {/* Close button (Mobile) */}
          <button
            onClick={onClose}
            className={`lg:hidden p-2 rounded-full absolute right-4 transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
          >
            <X className="w-5 h-5 text-[#94A3B8]" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative z-10 pb-4">
          <nav className="flex flex-col h-full w-full">
            <div className="flex-1 w-full whitespace-nowrap">
              {NAV_GROUPS.map((group, groupIndex) => (
                <div key={group.title} className="mb-2">
                  <div 
                    className="px-6 mb-2 mt-4"
                    style={{ 
                      opacity: isExpanded ? 1 : 0, 
                      height: isExpanded ? 'auto' : '0px',
                      overflow: 'hidden',
                      transition: 'opacity 350ms ease' 
                    }}
                  >
                    <span className={`text-[10px] uppercase tracking-[0.08em] font-semibold ${isLight ? 'text-[#A3AED0]' : 'text-[#64748B]'}`}>
                      {group.title}
                    </span>
                  </div>
                  
                  <ul className="flex flex-col">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <li key={item.path} className="w-full">
                          <NavLink
                            to={item.path}
                            onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                            className="flex items-center group relative outline-none"
                            style={{ padding: '4px 8px' }}
                          >
                            <div
                              className="flex items-center w-full transition-all duration-[180ms] ease-out rounded-[14px]"
                              style={{ 
                                height: '44px',
                                padding: '0 10px',
                                background: isActive 
                                  ? (isLight 
                                      ? 'linear-gradient(135deg, rgba(67, 24, 255, 0.12), rgba(67, 24, 255, 0.04))' 
                                      : 'linear-gradient(135deg, rgba(249,115,22,0.20), rgba(249,115,22,0.08))')
                                  : 'transparent',
                                border: isActive 
                                  ? (isLight ? '1px solid rgba(67, 24, 255, 0.18)' : '1px solid rgba(249,115,22,0.20)') 
                                  : '1px solid transparent',
                                boxShadow: isActive 
                                  ? (isLight ? '0 6px 20px rgba(67, 24, 255, 0.08)' : '0 6px 20px rgba(249,115,22,0.12)') 
                                  : 'none',
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.background = isLight ? 'rgba(112, 144, 176, 0.08)' : 'rgba(255,255,255,0.06)';
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <div 
                                className="w-[36px] h-[36px] rounded-[12px] flex items-center justify-center shrink-0 transition-transform duration-[180ms]"
                                style={{ transform: isActive ? 'none' : 'translateX(0px)' }}
                              >
                                <Icon 
                                  className="w-[20px] h-[20px] transition-colors duration-[180ms]" 
                                  style={{ color: isActive ? 'var(--color-primary)' : (isLight ? '#A3AED0' : '#94A3B8') }} 
                                />
                              </div>
                              <span 
                                className="ml-3 text-[14px] transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                                style={{ 
                                  color: isActive 
                                    ? (isLight ? 'var(--color-primary)' : '#FFFFFF') 
                                    : (isLight ? '#707EAE' : '#CBD5E1'),
                                  fontWeight: isActive ? '600' : '500',
                                  opacity: isExpanded ? 1 : 0,
                                  transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                                }}
                              >
                                {item.label}
                              </span>
                            </div>
                            
                            {/* Hover Tooltip (Only visible when collapsed) */}
                            {!isExpanded && (
                              <div 
                                className={`absolute left-[70px] px-3 py-1.5 rounded-[10px] text-[13px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[100] whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.25)] ${isLight ? 'bg-white border border-[#E2E8F0] text-[#2B3674]' : 'bg-[#071329] border border-white/10 text-white'}`}
                              >
                                {item.label}
                              </div>
                            )}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Footer Section */}
            <div className="mt-auto pt-6 pb-2 px-[18px] shrink-0 w-full whitespace-nowrap overflow-hidden">
              <div 
                style={{ 
                  height: '1px', 
                  width: '100%', 
                  background: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                  marginBottom: '16px',
                  opacity: isExpanded ? 1 : 0
                }} 
              />
              <div className="flex flex-col">
                <span 
                  className={`text-[14px] font-bold transition-opacity duration-[350ms] ${isLight ? 'text-[#2B3674]' : 'text-white'}`}
                  style={{ opacity: isExpanded ? 1 : 0 }}
                >
                  FinanceFlow
                </span>
                <span 
                  className={`text-[12px] transition-opacity duration-[350ms] ${isLight ? 'text-[#707EAE]' : 'text-[#94A3B8]'}`}
                  style={{ opacity: isExpanded ? 1 : 0 }}
                >
                  Premium Edition
                </span>
              </div>
            </div>
          </nav>
        </div>
        
        {/* Hover zone for desktop if we want to expand on hover */}
        <div 
          className="absolute inset-0 z-[-1] hidden lg:block cursor-pointer"
          onClick={() => setIsExpanded(true)}
        />
      </aside>
    </>
  );
};

export default Sidebar;
