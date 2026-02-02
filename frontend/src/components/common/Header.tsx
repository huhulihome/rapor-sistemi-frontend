import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { NotificationBell } from './NotificationBell';
import {
  Bars3Icon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  user_id?: string | null;
  title: string;
  message?: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();

    // Setup realtime subscription for new notifications
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          // Check if notification is for current user or is broadcast
          if (!newNotif.user_id || newNotif.user_id === user?.id) {
            setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/notifications?limit=10`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setNotifications(result.data?.notifications || []);
        setUnreadCount(result.data?.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-dark border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Menu button and logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 [&>svg]:w-6 [&>svg]:h-6"
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <Link to="/dashboard" className="hidden lg:flex items-center">
            <h1 className="text-xl font-bold gradient-text">
              Modern Office System
            </h1>
          </Link>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <NotificationBell
            count={unreadCount}
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
          />

          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">
                {user?.profile?.full_name || user?.email?.split('@')[0]}
              </p>
              {isAdmin && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-blue-400 bg-blue-500/10 rounded-full">
                  Admin
                </span>
              )}
            </div>

            {/* User Avatar */}
            <Link
              to="/profile"
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
            >
              {(user?.profile?.full_name || user?.email || 'U')[0].toUpperCase()}
            </Link>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 [&>svg]:w-4 [&>svg]:h-4"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Çıkış
          </button>
        </div>
      </div>
    </header>
  );
};
