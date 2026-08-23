/**
 * Notification DXP Component Service - Server-Side Renderer
 *
 * Full server-side rendering: generates complete notification markup on server.
 * No client-side JavaScript required for rendering.
 */

import { escapeAttr, escapeHtml } from "../../../utils/sanitize.js";

const iconMap = {
  info: "fa-light fa-circle-info",
  success: "fa-light fa-circle-check",
  warning: "fa-light fa-triangle-exclamation",
  danger: "fa-light fa-circle-exclamation",
};

const normalizeVariant = (variant) => {
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

const resolveText = (primary, fallback) => primary || fallback || "";

const main = async (input) => {
  const { title, message, Title, Message, variant, className, cssClass } =
    input || {};

  const resolvedVariant = normalizeVariant(variant);
  const resolvedTitle = resolveText(title, Title);
  const resolvedMessage = resolveText(message, Message);
  const messageHtml =
    typeof resolvedMessage === "string" ? resolvedMessage : "";
  const resolvedClassName = resolveText(className, cssClass);

  const containerClasses = [
    "notification",
    `notification--${resolvedVariant}`,
    resolvedClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const iconClass = iconMap[resolvedVariant];

  return `<div class="${escapeAttr(containerClasses)}" role="status">
    <div class="notification__accent-bar" aria-hidden="true"></div>
    <div class="notification__content">
      <div class="notification__header">
        <div class="notification__icon" aria-hidden="true">
          <i class="${escapeAttr(iconClass)}" aria-hidden="true"></i>
        </div>
        <div class="notification__text">
          <div class="notification__title">${escapeHtml(resolvedTitle)}</div>
          <div class="notification__message" data-sq-field="message">${messageHtml}</div>
        </div>
      </div>
    </div>
  </div>`;
};

export default {
  main,
};
