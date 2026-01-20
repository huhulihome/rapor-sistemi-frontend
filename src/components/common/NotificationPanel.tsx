import React from 'react';
import { CheckIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { classNames } from '../../utils/classNames';

interface Notification {
    id: string;
    title: string;
    message?: string;
    type: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationPanelProps {
    notifications: Notification[];
    onMarkRead?: (id: string) => void;
    onMarkAllRead?: () => void;
    onClose?: () => void;
}

const typeColors: Record<string, string> = {
    info: 'bg-blue-500/20 text-blue-400',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    error: 'bg-red-500/20 text-red-400',
    task: 'bg-purple-500/20 text-purple-400',
    issue: 'bg-orange-500/20 text-orange-400',
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
    notifications,
    onMarkRead,
    onMarkAllRead,
    onClose,
}) => {
    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read && onMarkRead) {
            onMarkRead(notification.id);
        }
        if (onClose) onClose();
    };

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-hidden bg-slate-800 border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white">Bildirimler</h3>
                {notifications.some(n => !n.is_read) && onMarkAllRead && (
                    <button
                        onClick={onMarkAllRead}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors [&>svg]:w-3.5 [&>svg]:h-3.5"
                    >
                        <CheckIcon className="h-3.5 w-3.5" />
                        Tümünü Okundu İşaretle
                    </button>
                )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <BellAlertIcon className="mx-auto h-10 w-10 text-slate-500 mb-2" />
                        <p className="text-sm text-slate-400">Bildiriminiz yok</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((notification) => {
                            const content = (
                                <div
                                    className={classNames(
                                        'px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer',
                                        !notification.is_read ? 'bg-blue-500/5' : ''
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Unread indicator */}
                                        {!notification.is_read && (
                                            <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                        )}
                                        <div className={classNames('flex-1 min-w-0', notification.is_read ? 'ml-5' : '')}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span
                                                    className={classNames(
                                                        'px-2 py-0.5 text-[10px] font-semibold rounded uppercase',
                                                        typeColors[notification.type] || typeColors.info
                                                    )}
                                                >
                                                    {notification.type}
                                                </span>
                                                <span className="text-[11px] text-slate-500">
                                                    {formatTime(notification.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-white truncate">{notification.title}</p>
                                            {notification.message && (
                                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );

                            return notification.link ? (
                                <Link key={notification.id} to={notification.link}>
                                    {content}
                                </Link>
                            ) : (
                                <div key={notification.id}>{content}</div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-white/10">
                    <Link
                        to="/notifications"
                        className="block text-center text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        onClick={onClose}
                    >
                        Tüm Bildirimleri Gör
                    </Link>
                </div>
            )}
        </div>
    );
};
