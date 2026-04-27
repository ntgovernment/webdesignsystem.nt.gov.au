/**
 * HTML/Attribute Sanitization Utilities
 *
 * Shared utilities for escaping user input and preventing XSS vulnerabilities.
 * Used across all components for consistent and secure string handling.
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param str - String to escape
 * @returns Escaped string safe for HTML content
 */
export function escapeHtml(str: string | undefined | null): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escape string for use in HTML attributes
 * @param str - String to escape
 * @returns Escaped string safe for HTML attributes
 */
export function escapeAttr(str: string | undefined | null): string {
  return escapeHtml(str);
}
