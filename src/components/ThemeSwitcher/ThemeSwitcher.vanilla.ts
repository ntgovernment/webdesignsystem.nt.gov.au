/**
 * Vanilla JS Theme Switcher Component
 * Lightweight implementation without React dependency for Squiz Matrix embedding
 */

export interface ThemeSwitcherConfig {
  themes?: string[];
  defaultTheme?: string;
  storageKey?: string;
  className?: string;
}

export class ThemeSwitcherComponent {
  private container: HTMLElement;
  private config: Required<ThemeSwitcherConfig>;
  private currentTheme: string;
  private selectElement: HTMLSelectElement | null = null;

  constructor(container: HTMLElement, config: ThemeSwitcherConfig = {}) {
    this.container = container;
    this.config = {
      themes: config.themes || ["light", "dark"],
      defaultTheme: config.defaultTheme || "light",
      storageKey: config.storageKey || "web-design-system-theme",
      className: config.className || "",
    };

    // Get initial theme from localStorage or use default
    this.currentTheme = this.getInitialTheme();

    this.render();
    this.applyTheme();
  }

  private getInitialTheme(): string {
    if (typeof localStorage !== "undefined") {
      const savedTheme = localStorage.getItem(this.config.storageKey);
      if (savedTheme && this.config.themes.includes(savedTheme)) {
        return savedTheme;
      }
    }
    return this.config.defaultTheme;
  }

  private render(): void {
    const className = this.config.className
      ? `nt-theme-switcher ${this.config.className}`
      : "nt-theme-switcher";

    const optionsHtml = this.config.themes
      .map((theme) => {
        const selected = theme === this.currentTheme ? "selected" : "";
        const label = theme.charAt(0).toUpperCase() + theme.slice(1);
        return `<option value="${theme}" ${selected}>${label}</option>`;
      })
      .join("");

    this.container.innerHTML = `
      <div class="${className}">
        <label for="theme-select" class="nt-theme-switcher__label">
          Theme:
        </label>
        <select id="theme-select" class="nt-theme-switcher__select">
          ${optionsHtml}
        </select>
      </div>
    `;

    // Attach event listener
    this.selectElement = this.container.querySelector("#theme-select");
    if (this.selectElement) {
      this.selectElement.addEventListener("change", (e) => {
        this.handleThemeChange((e.target as HTMLSelectElement).value);
      });
    }
  }

  private handleThemeChange(theme: string): void {
    this.currentTheme = theme;
    this.applyTheme();

    // Save to localStorage
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(this.config.storageKey, theme);
    }
  }

  private applyTheme(): void {
    document.documentElement.setAttribute("data-theme", this.currentTheme);
  }

  public getTheme(): string {
    return this.currentTheme;
  }

  public setTheme(theme: string): void {
    if (this.config.themes.includes(theme)) {
      this.currentTheme = theme;
      this.applyTheme();

      if (this.selectElement) {
        this.selectElement.value = theme;
      }

      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.config.storageKey, theme);
      }
    }
  }

  public destroy(): void {
    this.container.innerHTML = "";
    this.selectElement = null;
  }
}

// Auto-mount functionality for standalone use
if (typeof document !== "undefined") {
  const initThemeSwitcher = () => {
    const container = document.getElementById("nt-theme-switcher-root");

    if (container) {
      // Read configuration from data attributes
      const themesAttr = container.getAttribute("data-themes");
      const config: ThemeSwitcherConfig = {
        themes: themesAttr
          ? themesAttr.split(",").map((t) => t.trim())
          : undefined,
        defaultTheme: container.getAttribute("data-default-theme") || undefined,
        storageKey: container.getAttribute("data-storage-key") || undefined,
        className: container.getAttribute("data-class") || undefined,
      };

      new ThemeSwitcherComponent(container, config);
    }
  };

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeSwitcher);
  } else {
    initThemeSwitcher();
  }
}

// Expose ThemeSwitcherComponent globally to prevent variable name conflicts with minification
declare global {
  interface Window {
    NTGThemeSwitcher: typeof ThemeSwitcherComponent;
  }
}

if (typeof window !== "undefined") {
  window.NTGThemeSwitcher = ThemeSwitcherComponent;
}
