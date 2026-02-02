import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { classNames } from '../../utils/classNames';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, adminOnly: false },
    { name: 'Görevler', href: '/tasks', icon: ClipboardDocumentListIcon, adminOnly: false },
    { name: 'Sorunlar', href: '/issues', icon: ExclamationTriangleIcon, adminOnly: false },
    { name: 'Analitik', href: '/analytics', icon: ChartBarIcon, adminOnly: false },
    { name: 'Kullanıcılar', href: '/users', icon: UserGroupIcon, adminOnly: true },
  ];

  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950',
          'border-r border-white/5',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">MO</span>
              </div>
              <span className="text-lg font-bold text-white">Office</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-dark">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={classNames(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <div className="mr-3 [&>svg]:w-5 [&>svg]:h-5">
                    <item.icon
                      className={classNames(
                        'h-5 w-5 transition-colors',
                        isActive
                          ? 'text-blue-400'
                          : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    />
                  </div>
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/5">
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-slate-500 text-center">
                © 2024 Modern Office
              </p>
              <p className="text-xs text-slate-600 text-center mt-1">
                v1.0.0
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
