import { Menu, LogOut, User, ChevronDown, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { getGreeting } from '../../lib/utils';
import NotificationBell from '../common/NotificationBell';
import logoImg from '../../assets/logo1.png';

const Header = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className="flex items-center justify-between px-5 lg:px-8 relative z-40 shrink-0"
      style={{
        height: '68px',
        background: 'var(--color-header-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        
        <img 
          src={logoImg} 
          alt="FinanceFlow Logo" 
          className="lg:hidden w-8 h-8 object-contain" 
        />
        
        <div className="flex flex-col justify-center ml-1 lg:ml-0">
          <h1 className="text-[18px] lg:text-[20px] font-bold leading-tight tracking-wide" style={{ color: 'var(--color-text)' }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-[var(--color-text-secondary)] hover:text-orange-400 transition-colors" />
          ) : (
            <Moon className="w-5 h-5 text-[var(--color-text-secondary)] hover:text-blue-400 transition-colors" />
          )}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <span className="text-[14px] font-medium hidden sm:block" style={{ color: 'var(--color-text)' }}>
              {user?.name}
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-[16px] p-2 animate-scale-in z-50 flex flex-col gap-1"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <button
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-[14px] font-medium rounded-[10px] transition-all hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <User className="w-[18px] h-[18px]" />
                Profile
              </button>
              
              <div className="my-0.5 mx-2" style={{ borderTop: '1px solid var(--color-border-light)' }} />
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-[14px] font-medium rounded-[10px] transition-all hover:bg-red-500/10 text-[var(--color-danger)]"
              >
                <LogOut className="w-[18px] h-[18px]" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
