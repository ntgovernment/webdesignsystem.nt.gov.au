/**
 * ThemeSwitcher DXP Component Service - Server-Side Renderer
 *
 * Uses hydration pattern: server renders minimal container with data attributes,
 * client-side JavaScript (theme-switcher.js) handles full rendering and interactivity.
 */
import { escapeHtml } from "../../../utils/sanitize.js";
import { generateInstanceId } from "../../../utils/instance-id.js";
export default {
  async render(input) {
    const {
      themes = [],
      height = "600px",
      defaultTheme = "",
      cssClass = "",
    } = input;

    // Validate themes array
    if (!Array.isArray(themes) || themes.length === 0) {
      return '<div class="nt-theme-switcher-error" style="padding: 2rem; background: #fee; border: 2px solid #c33; color: #c33; border-radius: 4px;">Error: At least one theme is required</div>';
    }

    if (themes.length > 3) {
      return '<div class="nt-theme-switcher-error" style="padding: 2rem; background: #fee; border: 2px solid #c33; color: #c33; border-radius: 4px;">Error: Maximum 3 themes allowed</div>';
    }

    // Validate each theme object
    for (const theme of themes) {
      if (!theme.name || !theme.url) {
        return '<div class="nt-theme-switcher-error" style="padding: 2rem; background: #fee; border: 2px solid #c33; color: #c33; border-radius: 4px;">Error: Each theme must have a name and url property</div>';
      }
    }

    // Generate unique ID for this instance
    const instanceId = `ts-${Math.random().toString(36).substring(2, 11)}`;

    // Encode props as JSON for hydration
    const hydrationProps = JSON.stringify({
      themes,
      height,
      defaultTheme,
    });

    // Return minimal hydration container
    return `<div class="nt-theme-switcher ${cssClass}" data-hydration-component="theme-switcher" data-hydration-props="${escapeHtml(hydrationProps)}" data-instance-id="${instanceId}"></div>`;
  },
};
