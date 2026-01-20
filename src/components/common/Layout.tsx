import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNavigation } from './BottomNavigation';
import { useMobile } from '../../hooks/useMobile';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { viewport } = useMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64">
          <div className={`max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 ${viewport.isSmall ? 'pb-24' : ''}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Show bottom navigation only on mobile */}
      {viewport.isSmall && <BottomNavigation />}
    </div>
  );
};
