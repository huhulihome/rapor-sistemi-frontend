import { type ReactNode, useRef, useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { hapticFeedback } from '../../utils/mobile';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at the top of the page
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY === 0 || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      // Only pull down
      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault();
        
        // Apply resistance
        const resistance = 2.5;
        const adjustedDistance = distance / resistance;
        
        setPullDistance(Math.min(adjustedDistance, threshold * 1.5));

        // Haptic feedback when reaching threshold
        if (adjustedDistance >= threshold && pullDistance < threshold) {
          hapticFeedback('medium');
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        hapticFeedback('heavy');
        
        try {
          await onRefresh();
        } catch (error) {
          console.error('Error refreshing:', error);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
      
      setStartY(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [startY, pullDistance, threshold, isRefreshing, disabled, onRefresh]);

  const rotation = (pullDistance / threshold) * 360;

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{
          height: pullDistance,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <div
            className={`transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: isRefreshing ? 'rotate(0deg)' : `rotate(${rotation}deg)`,
            }}
          >
            <ArrowPathIcon
              className={`h-6 w-6 ${
                pullDistance >= threshold ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
          </div>
          
          {pullDistance > 20 && (
            <span className="text-xs text-gray-600">
              {isRefreshing
                ? 'Yenileniyor...'
                : pullDistance >= threshold
                ? 'Bırakın'
                : 'Çekin'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
