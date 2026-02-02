import { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import {
  initPWAInstallPrompt,
  showInstallPrompt,
  isPWAInstalled,
  isPWAInstallable,
  isIOS,
} from '../../utils/pwa';

export const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isPWAInstalled()) {
      return;
    }

    // Initialize install prompt listener
    initPWAInstallPrompt(() => {
      // Wait a bit before showing the prompt to not be intrusive
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    });

    // Check if on iOS and show instructions
    if (isIOS() && !isPWAInstalled()) {
      setTimeout(() => {
        setShowIOSInstructions(true);
      }, 5000);
    }
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  const handleDismissIOS = () => {
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-ios-prompt-dismissed', Date.now().toString());
  };

  // Check if user dismissed recently (within 7 days)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        setShowPrompt(false);
      }
    }

    const dismissedIOS = localStorage.getItem('pwa-ios-prompt-dismissed');
    if (dismissedIOS) {
      const dismissedTime = parseInt(dismissedIOS);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        setShowIOSInstructions(false);
      }
    }
  }, []);

  if (!showPrompt && !showIOSInstructions) {
    return null;
  }

  // iOS Installation Instructions
  if (showIOSInstructions && isIOS()) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <ArrowDownTrayIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Uygulamayı Yükle
              </h3>
            </div>
            <button
              onClick={handleDismissIOS}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-medium">iOS'ta yüklemek için:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Safari'de <span className="font-semibold">Paylaş</span> butonuna tıklayın</li>
              <li><span className="font-semibold">"Ana Ekrana Ekle"</span> seçeneğini seçin</li>
              <li><span className="font-semibold">"Ekle"</span> butonuna tıklayın</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Standard PWA Install Prompt
  if (showPrompt && isPWAInstallable()) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-4 text-white">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <ArrowDownTrayIcon className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">
                Uygulamayı Yükle
              </h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-sm text-white/90 mb-4">
            Modern Office System'i cihazınıza yükleyin ve çevrimdışı erişim kazanın.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              Yükle
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-md font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              Daha Sonra
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
