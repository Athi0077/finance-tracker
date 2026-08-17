import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/': 'Dashboard',
  '/categories': 'Categories',
  '/transactions': 'Transactions',
  '/profile': 'Profile',
};

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'FinanceFlow';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      <div 
        className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? 'desktop-sidebar-padding-expanded' : 'desktop-sidebar-padding-collapsed'}`}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-5 lg:p-6" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <div className="max-w-7xl mx-auto w-full pb-12 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
