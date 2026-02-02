import { useState, useEffect } from 'react';
import {
  isMobileDevice,
  isTablet,
  isMobilePhone,
  isTouchDevice,
  getDeviceType,
  getOrientation,
  isSmallViewport,
  isMediumViewport,
  isLargeViewport,
} from '../utils/mobile';

export interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isPhone: boolean;
  isTouch: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  viewport: {
    isSmall: boolean;
    isMedium: boolean;
    isLarge: boolean;
    width: number;
    height: number;
  };
}

export const useMobile = (): MobileState => {
  const [state, setState] = useState<MobileState>({
    isMobile: isMobileDevice(),
    isTablet: isTablet(),
    isPhone: isMobilePhone(),
    isTouch: isTouchDevice(),
    deviceType: getDeviceType(),
    orientation: getOrientation(),
    viewport: {
      isSmall: isSmallViewport(),
      isMedium: isMediumViewport(),
      isLarge: isLargeViewport(),
      width: window.innerWidth,
      height: window.innerHeight,
    },
  });

  useEffect(() => {
    const handleResize = () => {
      setState({
        isMobile: isMobileDevice(),
        isTablet: isTablet(),
        isPhone: isMobilePhone(),
        isTouch: isTouchDevice(),
        deviceType: getDeviceType(),
        orientation: getOrientation(),
        viewport: {
          isSmall: isSmallViewport(),
          isMedium: isMediumViewport(),
          isLarge: isLargeViewport(),
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    };

    const handleOrientationChange = () => {
      // Wait for the orientation change to complete
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return state;
};
