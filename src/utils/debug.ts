/**
 * Debug Logging Utilities
 *
 * Conditional logging that only outputs in development mode.
 * Prevents console pollution in production builds.
 */

const isDev = import.meta.env.DEV;

/**
 * Log debug message (development only)
 * @param args - Arguments to log
 */
export function debugLog(...args: unknown[]): void {
  if (isDev) {
    console.log(...args);
  }
}

/**
 * Log error message (development only)
 * @param args - Arguments to log
 */
export function debugError(...args: unknown[]): void {
  if (isDev) {
    console.error(...args);
  }
}

/**
 * Log warning message (development only)
 * @param args - Arguments to log
 */
export function debugWarn(...args: unknown[]): void {
  if (isDev) {
    console.warn(...args);
  }
}
