// Mobile device detection and optimization utilities

/**
 * Check if the device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Check if the device is a tablet
 */
export const isTablet = (): boolean => {
  return /iPad|Android/i.test(navigator.userAgent) && !isMobilePhone();
};

/**
 * Check if the device is a mobile phone
 */
export const isMobilePhone = (): boolean => {
  return /iPhone|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Check if the device supports touch
 */
export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Get device type
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobilePhone()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};

/**
 * Get screen orientation
 */
export const getOrientation = (): 'portrait' | 'landscape' => {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

/**
 * Check if device is in landscape mode
 */
export const isLandscape = (): boolean => {
  return getOrientation() === 'landscape';
};

/**
 * Check if device is in portrait mode
 */
export const isPortrait = (): boolean => {
  return getOrientation() === 'portrait';
};

/**
 * Get viewport dimensions
 */
export const getViewportDimensions = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Check if viewport is small (mobile-sized)
 */
export const isSmallViewport = (): boolean => {
  return window.innerWidth < 768;
};

/**
 * Check if viewport is medium (tablet-sized)
 */
export const isMediumViewport = (): boolean => {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

/**
 * Check if viewport is large (desktop-sized)
 */
export const isLargeViewport = (): boolean => {
  return window.innerWidth >= 1024;
};

/**
 * Prevent default touch behavior (useful for custom gestures)
 */
export const preventDefaultTouch = (e: TouchEvent) => {
  e.preventDefault();
};

/**
 * Enable smooth scrolling
 */
export const enableSmoothScrolling = () => {
  document.documentElement.style.scrollBehavior = 'smooth';
};

/**
 * Disable smooth scrolling
 */
export const disableSmoothScrolling = () => {
  document.documentElement.style.scrollBehavior = 'auto';
};

/**
 * Scroll to top of page
 */
export const scrollToTop = (smooth = true) => {
  if (smooth) {
    enableSmoothScrolling();
  }
  window.scrollTo(0, 0);
  if (smooth) {
    setTimeout(disableSmoothScrolling, 500);
  }
};

/**
 * Scroll to element
 */
export const scrollToElement = (element: HTMLElement, smooth = true) => {
  if (smooth) {
    enableSmoothScrolling();
  }
  element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  if (smooth) {
    setTimeout(disableSmoothScrolling, 500);
  }
};

/**
 * Vibrate device (if supported)
 */
export const vibrate = (pattern: number | number[] = 200): boolean => {
  if ('vibrate' in navigator) {
    return navigator.vibrate(pattern);
  }
  return false;
};

/**
 * Add haptic feedback for touch interactions
 */
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const patterns = {
    light: 10,
    medium: 20,
    heavy: 50,
  };
  vibrate(patterns[type]);
};

/**
 * Detect swipe gesture
 */
export interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  duration: number;
}

export const detectSwipe = (
  element: HTMLElement,
  onSwipe: (event: SwipeEvent) => void,
  minDistance = 50
) => {
  let startX = 0;
  let startY = 0;
  let startTime = 0;

  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const endTime = Date.now();

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const duration = endTime - startTime;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > minDistance || absY > minDistance) {
      let direction: 'left' | 'right' | 'up' | 'down';
      let distance: number;

      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
        distance = absX;
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
        distance = absY;
      }

      onSwipe({ direction, distance, duration });
    }
  };

  element.addEventListener('touchstart', handleTouchStart);
  element.addEventListener('touchend', handleTouchEnd);

  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
  };
};

/**
 * Detect long press gesture
 */
export const detectLongPress = (
  element: HTMLElement,
  onLongPress: () => void,
  duration = 500
) => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const handleTouchStart = () => {
    timer = setTimeout(() => {
      hapticFeedback('medium');
      onLongPress();
    }, duration);
  };

  const handleTouchEnd = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  element.addEventListener('touchstart', handleTouchStart);
  element.addEventListener('touchend', handleTouchEnd);
  element.addEventListener('touchcancel', handleTouchEnd);

  return () => {
    if (timer) clearTimeout(timer);
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
    element.removeEventListener('touchcancel', handleTouchEnd);
  };
};

/**
 * Prevent zoom on double tap (iOS)
 */
export const preventDoubleTapZoom = () => {
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );
};

/**
 * Lock screen orientation
 */
export const lockOrientation = async (
  orientation: 'portrait' | 'landscape'
): Promise<boolean> => {
  if ('orientation' in screen && 'lock' in screen.orientation) {
    try {
      await (screen.orientation as any).lock(orientation);
      return true;
    } catch (error) {
      console.error('Error locking orientation:', error);
      return false;
    }
  }
  return false;
};

/**
 * Unlock screen orientation
 */
export const unlockOrientation = () => {
  if ('orientation' in screen && 'unlock' in screen.orientation) {
    (screen.orientation as any).unlock();
  }
};

/**
 * Request fullscreen mode
 */
export const requestFullscreen = async (element?: HTMLElement): Promise<boolean> => {
  const elem = element || document.documentElement;
  
  try {
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
      return true;
    } else if ((elem as any).webkitRequestFullscreen) {
      await (elem as any).webkitRequestFullscreen();
      return true;
    } else if ((elem as any).msRequestFullscreen) {
      await (elem as any).msRequestFullscreen();
      return true;
    }
  } catch (error) {
    console.error('Error requesting fullscreen:', error);
  }
  
  return false;
};

/**
 * Exit fullscreen mode
 */
export const exitFullscreen = async (): Promise<boolean> => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      return true;
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
      return true;
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
      return true;
    }
  } catch (error) {
    console.error('Error exiting fullscreen:', error);
  }
  
  return false;
};

/**
 * Check if in fullscreen mode
 */
export const isFullscreen = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).msFullscreenElement
  );
};
