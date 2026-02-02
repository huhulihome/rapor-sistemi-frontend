import React from 'react';

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  isOnline,
  size = 'md',
  showLabel = false,
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-1">
      <span
        className={`${sizeClasses[size]} rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        } ${isOnline ? 'animate-pulse' : ''}`}
        title={isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
      />
      {showLabel && (
        <span className="text-xs text-gray-600">
          {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
        </span>
      )}
    </div>
  );
};
