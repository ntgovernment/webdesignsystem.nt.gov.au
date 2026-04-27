/**
 * Instance ID Generation Utility
 *
 * Generates unique identifiers for component instances.
 * Used for DOM element IDs, data attributes, and tracking.
 */

/**
 * Generate a unique instance ID with optional prefix
 * @param prefix - Optional prefix for the ID (e.g., 'cv', 'ts', 'tc')
 * @returns Unique identifier string (e.g., 'cv-a1b2c3d4e')
 */
export function generateInstanceId(prefix = ""): string {
  const randomId = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}-${randomId}` : randomId;
}
