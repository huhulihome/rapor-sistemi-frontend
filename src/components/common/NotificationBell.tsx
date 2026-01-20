import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { NotificationPanel } from './NotificationPanel';

interface NotificationBellProps {
  count: number;
  notifications?: Array<{
    id: string;
    title: string;
    message?: string;
    type: string;
    link?: string;
    is_read: boolean;
    created_at: string;
  }>;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  count,
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = () => {
    if (onClick) onClick();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleClick}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-all duration-200 [&>svg]:w-5 [&>svg]:h-5"
        aria-label={`${count} okunmamış bildirim`}
      >
        <BellIcon className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg shadow-red-500/25">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
