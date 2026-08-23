/**
 * ColorSwatch Vanilla JS - Client-Side Hydration
 *
 * Renders a color swatch card with color sample, label, and hex code display.
 */

import "./ColorSwatch.css";
import { escapeAttr, escapeHtml } from "../../utils/sanitize";

export interface ColorSwatchProps {
  Name?: string;
  Hex?: string;
  Color?: string;
  Label?: string;
  HexCode?: string;
  cssClass?: string;
  // Fallback lowercase props for legacy compatibility
  name?: string;
  hex?: string;
  color?: string;
  label?: string;
  hexCode?: string;
  className?: string;
}

export class ColorSwatchClient {
  private container: HTMLElement;
  private props: ColorSwatchProps;

  constructor(container: HTMLElement, props?: ColorSwatchProps) {
    this.container = container;
    this.props = props || this.parseProps();
    this.render();
  }

  private parseProps(): ColorSwatchProps {
    try {
      return JSON.parse(
        this.container.dataset.hydrationProps || "{}",
      ) as ColorSwatchProps;
    } catch {
      return {};
    }
  }

  private resolveText(...values: Array<string | undefined>): string {
    return (
      values.find((value): value is string => typeof value === "string") ?? ""
    );
  }

  private render(): void {
    const name = this.resolveText(
      this.props.Name,
      this.props.name,
      this.props.Label,
      this.props.label,
    );
    const hex = this.resolveText(
      this.props.Hex,
      this.props.hex,
      this.props.HexCode,
      this.props.hexCode,
      this.props.Color,
      this.props.color,
    );
    const color = this.resolveText(
      this.props.Hex,
      this.props.hex,
      this.props.Color,
      this.props.color,
      this.props.HexCode,
      this.props.hexCode,
    );
    const cssClass = this.resolveText(
      this.props.cssClass,
      this.props.className,
    );

    const containerClass = ["nt-color-swatch", cssClass]
      .filter(Boolean)
      .join(" ");

    this.container.className = containerClass;

    this.container.innerHTML = `
      <div
        class="nt-color-swatch__sample"
        style="background-color: ${escapeAttr(color)}"
        aria-hidden="true"
      ></div>
      <div class="nt-color-swatch__content">
        <div class="nt-color-swatch__label">${escapeHtml(name)}</div>
        <div class="nt-color-swatch__hex">${escapeHtml(hex)}</div>
      </div>
    `;
  }
}

// Auto-mount functionality for standalone use
if (typeof document !== "undefined") {
  const initColorSwatches = () => {
    const nodes = document.querySelectorAll(
      '[data-hydration-component="color-swatch"]',
    );

    nodes.forEach((node) => {
      new ColorSwatchClient(node as HTMLElement);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initColorSwatches);
  } else {
    initColorSwatches();
  }
}

// Expose ColorSwatchClient globally to prevent variable name conflicts with minification
declare global {
  interface Window {
    NTGColorSwatch: typeof ColorSwatchClient;
  }
}

if (typeof window !== "undefined") {
  window.NTGColorSwatch = ColorSwatchClient;
}
