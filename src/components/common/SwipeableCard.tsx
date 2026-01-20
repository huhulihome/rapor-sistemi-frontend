import { type ReactNode, useRef, useEffect, useState } from 'react';
import { hapticFeedback } from '../../utils/mobile';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: ReactNode;
    label: string;
    color: string;
  };
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let startX = 0;
    let currentX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;
      
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      
      // Limit swipe distance
      const maxSwipe = 100;
      const limitedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff));
      
      setSwipeOffset(limitedDiff);
    };

    const handleTouchEnd = () => {
      setIsSwiping(false);
      
      const threshold = 50;
      
      if (swipeOffset > threshold && onSwipeRight) {
        hapticFeedback('medium');
        onSwipeRight();
      } else if (swipeOffset < -threshold && onSwipeLeft) {
        hapticFeedback('medium');
        onSwipeLeft();
      }
      
      // Reset position
      setSwipeOffset(0);
    };

    card.addEventListener('touchstart', handleTouchStart);
    card.addEventListener('touchmove', handleTouchMove);
    card.addEventListener('touchend', handleTouchEnd);
    card.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
      card.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isSwiping, swipeOffset, onSwipeLeft, onSwipeRight]);

  const showLeftAction = swipeOffset > 20 && rightAction;
  const showRightAction = swipeOffset < -20 && leftAction;

  return (
    <div className="relative overflow-hidden">
      {/* Left action background */}
      {showLeftAction && (
        <div
          className={`absolute inset-y-0 left-0 flex items-center px-4 ${rightAction?.color || 'bg-green-500'}`}
          style={{ width: Math.abs(swipeOffset) }}
        >
          <div className="flex items-center gap-2 text-white">
            {rightAction?.icon}
            {swipeOffset > 50 && <span className="text-sm font-medium">{rightAction?.label}</span>}
          </div>
        </div>
      )}

      {/* Right action background */}
      {showRightAction && (
        <div
          className={`absolute inset-y-0 right-0 flex items-center justify-end px-4 ${leftAction?.color || 'bg-red-500'}`}
          style={{ width: Math.abs(swipeOffset) }}
        >
          <div className="flex items-center gap-2 text-white">
            {swipeOffset < -50 && <span className="text-sm font-medium">{leftAction?.label}</span>}
            {leftAction?.icon}
          </div>
        </div>
      )}

      {/* Card content */}
      <div
        ref={cardRef}
        className={`relative transition-transform ${isSwiping ? '' : 'duration-200'} ${className}`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
