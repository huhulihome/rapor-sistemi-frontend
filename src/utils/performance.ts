/**
 * Performance monitoring and optimization utilities
 */

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName: string, callback: () => void) => {
  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  if (renderTime > 16) { // More than one frame (60fps)
    console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
  }
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Request idle callback wrapper with fallback
 */
export const requestIdleCallback = (callback: () => void, timeout = 2000) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  return setTimeout(callback, 1);
};

/**
 * Cancel idle callback with fallback
 */
export const cancelIdleCallback = (id: number) => {
  if ('cancelIdleCallback' in window) {
    return window.cancelIdleCallback(id);
  }
  return clearTimeout(id);
};

/**
 * Measure Web Vitals
 */
export const measureWebVitals = () => {
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsScore += (entry as any).value;
          console.log('CLS:', clsScore);
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
};

/**
 * Preconnect to external domains
 */
export const preconnectDomains = (domains: string[]) => {
  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });
};

/**
 * Prefetch resources
 */
export const prefetchResource = (url: string, as: string = 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get connection speed
 */
export const getConnectionSpeed = (): string => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (connection) {
    return connection.effectiveType || 'unknown';
  }
  return 'unknown';
};

/**
 * Check if user is on slow connection
 */
export const isSlowConnection = (): boolean => {
  const speed = getConnectionSpeed();
  return speed === 'slow-2g' || speed === '2g';
};
