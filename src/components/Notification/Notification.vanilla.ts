/**
 * Notification Vanilla JS - Client-Side Hydration
 *
 * Renders a status-specific notification with accent bar and icon.
 */

import "./Notification.css";
import { escapeAttr, escapeHtml } from "../../utils/sanitize";

export type NotificationVariant = "info" | "success" | "warning" | "danger";

export interface NotificationProps {
  variant?: NotificationVariant;
  message?: string;
  Message?: string;
}

const iconMap: Record<NotificationVariant, string> = {
  info: "fa-light fa-circle-info",
  success: "fa-light fa-circle-check",
  warning: "fa-light fa-triangle-exclamation",
  danger: "fa-light fa-circle-exclamation",
};

const normalizeVariant = (variant?: string): NotificationVariant => {
  switch (variant) {
    case "success":
    case "warning":
    case "danger":
    case "info":
      return variant;
    default:
      return "info";
  }
};

export class NotificationClient {
  private container: HTMLElement;
  private props: NotificationProps;

  constructor(container: HTMLElement, props?: NotificationProps) {
    this.container = container;
    this.props = props || this.parseProps();
    this.render();
  }

  private parseProps(): NotificationProps {
    try {
      return JSON.parse(
        this.container.dataset.hydrationProps || "{}",
      ) as NotificationProps;
    } catch {
      return {};
    }
  }

  private resolveText(primary?: string, fallback?: string): string {
    return primary || fallback || "";
  }

  private render(): void {
    const variant = normalizeVariant(this.props.variant);
    const message = this.resolveText(this.props.message, this.props.Message);
    const containerClass = ["notification", `notification--${variant}`]
      .filter(Boolean)
      .join(" ");

    this.container.className = containerClass;
    this.container.setAttribute("role", "status");

    const iconClass = iconMap[variant];

    this.container.innerHTML = `
      <div class="notification__accent-bar" aria-hidden="true"></div>
      <div class="notification__content">
        <div class="notification__header">
          <div class="notification__icon" aria-hidden="true">
            <i class="${escapeAttr(iconClass)}" aria-hidden="true"></i>
          </div>
          <div class="notification__text">
            <div class="notification__message">${escapeHtml(message)}</div>
          </div>
        </div>
      </div>
    `;
  }
}

// Auto-mount functionality for standalone use
if (typeof document !== "undefined") {
  const initNotifications = () => {
    const nodes = document.querySelectorAll(
      '[data-hydration-component="notification"]',
    );

    nodes.forEach((node) => {
      new NotificationClient(node as HTMLElement);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNotifications);
  } else {
    initNotifications();
  }
}

// Expose NotificationClient globally to prevent variable name conflicts with minification
declare global {
  interface Window {
    NTGNotification: typeof NotificationClient;
  }
}

if (typeof window !== "undefined") {
  window.NTGNotification = NotificationClient;
}
