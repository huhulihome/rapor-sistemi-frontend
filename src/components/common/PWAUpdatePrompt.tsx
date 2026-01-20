import { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { registerSWUpdateHandler, updateServiceWorker } from '../../utils/pwa';

export const PWAUpdatePrompt: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    registerSWUpdateHandler(() => {
      setShowUpdate(true);
    });
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateServiceWorker();
    } catch (error) {
      console.error('Error updating service worker:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <ArrowPathIcon className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Yeni Güncelleme Mevcut
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Uygulamanın yeni bir sürümü hazır. Güncellemek için sayfayı yenileyin.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center">
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Güncelleniyor...
                  </span>
                ) : (
                  'Şimdi Güncelle'
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Daha Sonra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
