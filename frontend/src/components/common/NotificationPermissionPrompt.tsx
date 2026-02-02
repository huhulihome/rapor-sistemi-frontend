import { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '../../utils/pushNotifications';

export const NotificationPermissionPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const checkPermission = () => {
      if (!isPushNotificationSupported()) {
        return;
      }

      const permission = getNotificationPermission();
      const dismissed = localStorage.getItem('notification-prompt-dismissed');

      // Show prompt if permission is default (not asked yet) and not dismissed
      if (permission === 'default' && !dismissed) {
        // Wait a bit before showing to not be intrusive
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      }
    };

    checkPermission();
  }, []);

  const handleEnable = async () => {
    setIsRequesting(true);

    try {
      const permission = await requestNotificationPermission();

      if (permission === 'granted') {
        setShowPrompt(false);
        // Store that user granted permission
        localStorage.setItem('notification-permission', 'granted');
      } else {
        // User denied or dismissed
        setShowPrompt(false);
        localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal with timestamp
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
  };

  const handleNeverAsk = () => {
    setShowPrompt(false);
    // Store permanent dismissal
    localStorage.setItem('notification-prompt-dismissed', 'permanent');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <div className="bg-slate-800 border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-4 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 [&>svg]:w-5 [&>svg]:h-5">
              <BellIcon className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">
                Bildirimleri Etkinleştir
              </h3>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white transition-colors [&>svg]:w-5 [&>svg]:h-5"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              Yeni görevler, sorunlar ve önemli güncellemeler hakkında anında bildirim alın.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleEnable}
                disabled={isRequesting}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isRequesting ? 'İzin İsteniyor...' : 'Bildirimleri Aç'}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Daha Sonra
                </button>
                <button
                  onClick={handleNeverAsk}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Tekrar Sorma
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
