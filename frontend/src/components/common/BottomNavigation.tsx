import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardIconSolid,
  ExclamationCircleIcon as ExclamationIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';
import { hapticFeedback } from '../../utils/mobile';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconActive: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Ana Sayfa',
      icon: HomeIcon,
      iconActive: HomeIconSolid,
    },
    {
      path: '/tasks',
      label: 'Görevler',
      icon: ClipboardDocumentListIcon,
      iconActive: ClipboardIconSolid,
    },
    {
      path: '/issues',
      label: 'Sorunlar',
      icon: ExclamationCircleIcon,
      iconActive: ExclamationIconSolid,
    },
    {
      path: '/analytics',
      label: 'Analiz',
      icon: ChartBarIcon,
      iconActive: ChartBarIconSolid,
    },
    {
      path: '/profile',
      label: 'Profil',
      icon: UserCircleIcon,
      iconActive: UserCircleIconSolid,
    },
  ];

  const handleNavigation = (path: string) => {
    hapticFeedback('light');
    navigate(path);
  };

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || user?.profile?.role === 'admin'
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/5 safe-area-inset-bottom z-40 md:hidden">
      <div className="flex items-center justify-around h-16">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = isActive ? item.iconActive : item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 touch-manipulation ${isActive
                ? 'text-blue-400'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                <div className="[&>svg]:w-6 [&>svg]:h-6">
                  <Icon className="h-6 w-6 mb-1" />
                </div>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-blue-400' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
