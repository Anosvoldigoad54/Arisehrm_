// Performance optimization utilities for Arise HRM System

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit function execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Request animation frame wrapper for smooth animations
 */
export function requestAnimationFramePolyfill(): typeof requestAnimationFrame {
  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    (window as any).oRequestAnimationFrame ||
    (window as any).msRequestAnimationFrame ||
    function(callback: FrameRequestCallback) {
      return window.setTimeout(callback, 1000 / 60);
    }
  );
}

/**
 * Cancel animation frame wrapper
 */
export function cancelAnimationFramePolyfill(): typeof cancelAnimationFrame {
  return (
    window.cancelAnimationFrame ||
    (window as any).webkitCancelAnimationFrame ||
    (window as any).mozCancelAnimationFrame ||
    (window as any).oCancelAnimationFrame ||
    (window as any).msCancelAnimationFrame ||
    function(id: number) {
      window.clearTimeout(id);
    }
  );
}

/**
 * Measure execution time of a function
 */
export function measureExecutionTime<T>(
  fn: () => T,
  label = 'Function execution'
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  return result;
}

/**
 * Async version of measureExecutionTime
 */
export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
  label = 'Async function execution'
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  return result;
}

/**
 * Batch DOM updates for better performance
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
  if (updates.length === 0) return;
  
  // Use requestAnimationFrame for smooth updates
  requestAnimationFramePolyfill()(() => {
    updates.forEach(update => update());
  });
}

/**
 * Create a performance observer for specific metrics
 */
export function createPerformanceObserver(
  entryTypes: string[],
  callback: (entries: PerformanceEntry[]) => void
): PerformanceObserver | null {
  if (!('PerformanceObserver' in window)) {
    return null;
  }
  
  try {
    const observer = new PerformanceObserver(callback);
    observer.observe({ entryTypes });
    return observer;
  } catch (error) {
    return null;
  }
}

/**
 * Get memory usage information
 */
export function getMemoryInfo() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }
  return null;
}

/**
 * Check if device supports hardware acceleration
 */
export function supportsHardwareAcceleration(): boolean {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) return false;
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return renderer.includes('GPU') || renderer.includes('Graphics');
  }
  
  return true;
}

/**
 * Optimize images based on device capabilities
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  width: number,
  quality = 75,
  format = 'webp'
): string {
  // Check if WebP is supported
  const supportsWebP = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0;
  
  const finalFormat = supportsWebP ? format : 'jpeg';
  const params = new URLSearchParams({
    w: width.toString(),
    q: quality.toString(),
    f: finalFormat
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    case 'image':
      link.as = 'image';
      break;
    case 'font':
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
  }
  
  document.head.appendChild(link);
}

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImages(selector = 'img[data-src]'): void {
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    const images = document.querySelectorAll(selector);
    images.forEach((img: HTMLImageElement) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
    return;
  }
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });
  
  const images = document.querySelectorAll(selector);
  images.forEach(img => imageObserver.observe(img));
}

/**
 * Optimize scroll performance
 */
export function optimizeScroll(element: HTMLElement): () => void {
  // Add will-change for better scroll performance
  element.style.willChange = 'scroll-position';
  
  // Remove will-change after scroll ends
  let scrollTimeout: NodeJS.Timeout;
  const scrollHandler = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      element.style.willChange = 'auto';
    }, 100);
  };
  
  // Use passive event listeners for better scroll performance
  element.addEventListener('scroll', scrollHandler, { passive: true });
  
  // Return cleanup function
  return () => {
    element.removeEventListener('scroll', scrollHandler);
    clearTimeout(scrollTimeout);
    element.style.willChange = 'auto';
  };
}

/**
 * Check network conditions
 */
export function getNetworkInfo(): {
  effectiveType: string;
  downlink: number;
  rtt: number;
} | null {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0
    };
  }
  return null;
}

/**
 * Optimize based on network conditions
 */
export function getNetworkOptimizations(): {
  imageQuality: number;
  animationDuration: number;
  preloadCount: number;
} {
  const networkInfo = getNetworkInfo();
  
  if (!networkInfo) {
    return {
      imageQuality: 75,
      animationDuration: 300,
      preloadCount: 3
    };
  }
  
  const { effectiveType, downlink } = networkInfo;
  
  if (effectiveType === '4g' && downlink > 10) {
    return {
      imageQuality: 90,
      animationDuration: 300,
      preloadCount: 5
    };
  } else if (effectiveType === '3g' || downlink > 1) {
    return {
      imageQuality: 75,
      animationDuration: 400,
      preloadCount: 3
    };
  } else {
    return {
      imageQuality: 50,
      animationDuration: 500,
      preloadCount: 1
    };
  }
}

/**
 * Performance budget checker
 */
export class PerformanceBudget {
  private budgets: Map<string, number> = new Map();
  private measurements: Map<string, number[]> = new Map();
  
  constructor(budgets: Record<string, number>) {
    Object.entries(budgets).forEach(([key, value]) => {
      this.budgets.set(key, value);
      this.measurements.set(key, []);
    });
  }
  
  measure(metric: string, value: number): boolean {
    const budget = this.budgets.get(metric);
    if (!budget) return true;
    
    const measurements = this.measurements.get(metric) || [];
    measurements.push(value);
    this.measurements.set(metric, measurements);
    
    // Keep only last 10 measurements
    if (measurements.length > 10) {
      measurements.shift();
    }
    
    const average = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const isWithinBudget = average <= budget;
    
    if (!isWithinBudget) {
    }
    
    return isWithinBudget;
  }
  
  getReport(): Record<string, { budget: number; average: number; status: string }> {
    const report: Record<string, { budget: number; average: number; status: string }> = {};
    
    this.budgets.forEach((budget, metric) => {
      const measurements = this.measurements.get(metric) || [];
      const average = measurements.length > 0 
        ? measurements.reduce((a, b) => a + b, 0) / measurements.length 
        : 0;
      
      report[metric] = {
        budget,
        average,
        status: average <= budget ? 'within-budget' : 'exceeded'
      };
    });
    
    return report;
  }
}

/**
 * Export all utilities
 */
export default {
  debounce,
  throttle,
  requestAnimationFramePolyfill,
  cancelAnimationFramePolyfill,
  measureExecutionTime,
  measureAsyncExecutionTime,
  batchDOMUpdates,
  createPerformanceObserver,
  getMemoryInfo,
  supportsHardwareAcceleration,
  getOptimizedImageUrl,
  preloadResource,
  lazyLoadImages,
  optimizeScroll,
  getNetworkInfo,
  getNetworkOptimizations,
  PerformanceBudget
};
