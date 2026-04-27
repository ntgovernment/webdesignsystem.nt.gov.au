# External Design System Tokens

This directory contains CSS design tokens from the NT Government Web Design System repository. These tokens provide the foundation for consistent theming, spacing, typography, and component styling across the design system.

## 📦 Source Repository

- **Repository**: https://github.com/ntgovernment/web-design-system
- **Package**: `@ntgovernment/web-design-system`
- **Source Path**: `src/themes/` and `dist/`
- **License**: Check repository for licensing details

## 📂 Token Files

The following CSS files provide design tokens for the system:

### Core Foundation Tokens

1. **base-variables.css** - Core CSS custom properties (spacing, borders, shadows, radii)
   - Spacing scale (`--sp-xs`, `--sp-sm`, `--sp-md`, `--sp-lg`, `--sp-xl`, etc.)
   - Border widths (`--border-width-sm`, `--border-width-md`, etc.)
   - Shadow tokens (`--shadow-sm`, `--shadow-md`, `--shadow-lg`)
   - Border radius values (`--radii-sm`, `--radii-lg`, etc.)

2. **common.css** - Common design tokens shared across themes
   - Base color definitions
   - Component-agnostic tokens

3. **grid.css** - Grid system variables
   - Breakpoint definitions
   - Column counts
   - Gutter spacing
   - Grid offsets

### Typography Tokens

4. **typography.css** - Typography token definitions
   - Heading sizes (h1-h6)
   - Body text sizes
   - Line heights
   - Font weights
   - Letter spacing

5. **typography-literals.css** - Literal typography values
   - Text transform utilities
   - Fixed sizing values

6. **typography-ntg.css** - NT Government specific typography
   - Agency-specific type scales
   - Brand typography overrides

### Theme & Component Tokens

7. **theme-ntg.css** - NT Government theme
   - Color palette mappings
   - Semantic color tokens (`--clr-bg-default`, `--clr-text-default`, etc.)
   - Component-specific color assignments
   - Interactive state colors (hover, focus, active)

8. **table.css** - Table component styles ⭐ _Added February 2026_
   - Semantic HTML table styling
   - Striped row support
   - Hover states
   - Sortable header indicators
   - Caption styling
   - Fully design token-driven

## 🔄 Token Update Process

### Automated Setup (Recommended)

Once GitHub authentication is configured for npm:

```bash
# Install the package from GitHub
npm install

# Token files will be available at:
# node_modules/@ntgovernment/web-design-system/src/themes/
# or
# node_modules/@ntgovernment/web-design-system/dist/
```

**Configure GitHub Authentication:**

Create `~/.npmrc` (home directory):

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
@ntgovernment:registry=https://npm.pkg.github.com
```

Or use Git credential helper:

```bash
git config --global credential.helper manager
npm install  # Will use git credentials
```

### Manual Update Process

For environments without npm package access:

```bash
# 1. Clone the external repository
git clone https://github.com/ntgovernment/web-design-system.git ../temp-design-system

# 2. Copy token files
cp ../temp-design-system/src/themes/*.css ./src/external-tokens/
# or extract from dist bundle
cp ../temp-design-system/dist/ntg-theme.min.css ./src/external-tokens/

# 3. Clean up
rm -rf ../temp-design-system

# 4. Rebuild to include updates
npm run build
```

**Note:** Token files in this directory are **committed to git** (not ignored). This ensures consistent builds even when the external package is unavailable.

## 🎨 Usage

Tokens are imported hierarchically in `src/tokens.css`:

```css
/* External tokens (foundation) */
@import "./external-tokens/base-variables.css";
@import "./external-tokens/common.css";
@import "./external-tokens/grid.css";
@import "./external-tokens/typography.css";
@import "./external-tokens/typography-literals.css";
@import "./external-tokens/typography-ntg.css";
@import "./external-tokens/theme-ntg.css";
@import "./external-tokens/table.css";

/* Local overrides */
:root {
  /* Project-specific customizations override external tokens */
}
```

**Token Hierarchy:**

1. External tokens provide base values
2. Local tokens in `src/tokens.css` can override externals
3. Component styles consume tokens via CSS custom properties

## 🏗️ Build Integration

The build process automatically:

1. Imports tokens into the main CSS bundle via `src/web-design-system.css`
2. Copies individual token files to `deploy/external-tokens/` for reference
3. Bundles everything into `deploy/web-design-system.min.css`

## 📝 Token Naming Conventions

Tokens follow a consistent naming pattern:

- `--sp-*` - Spacing scale
- `--clr-*` - Color tokens
  - `--clr-bg-*` - Background colors
  - `--clr-text-*` - Text colors
  - `--clr-border-*` - Border colors
  - `--clr-link-*` - Link colors
  - `--clr-action-*` - Interactive element colors
- `--type-*` - Typography tokens
- `--border-*` - Border widths
- `--radii-*` - Border radius values
- `--shadow-*` - Box shadow definitions

## 🔍 For Developers & AI Agents

**Token Discovery:**

- All tokens are defined as CSS custom properties (variables)
- Use browser DevTools to inspect computed token values
- Token files are well-commented with usage context

**Best Practices:**

- Always use tokens rather than hardcoded values
- Check `src/tokens.css` for local overrides before adding new ones
- Tokens are cascade-aware: later imports override earlier ones
- Local project tokens (in `src/tokens.css`) take precedence over external tokens

**Adding New Tokens:**

1. Check if the token exists in external files first
2. If creating local tokens, add them to `src/tokens.css`
3. Follow the existing naming convention
4. Document the purpose and usage

**Version Tracking:**

- External token versions are tied to the `@ntgovernment/web-design-system` package version in `package.json`
- Track significant token updates in commit messages
- Test thoroughly after token updates as they affect all components

## 🎯 Key Token Categories

### Colors

See `theme-ntg.css` for the complete color system including:

- NT Government brand colors
- Semantic color assignments
- State colors (hover, active, focus)
- Status colors (success, warning, danger, info)

### Spacing

See `base-variables.css` for the spacing scale:

- `--sp-xs`: 8px
- `--sp-sm`: 12px
- `--sp-md`: 16px
- `--sp-lg`: 20px
- `--sp-xl`: 24px
- `--sp-xxl`: 32px
- `--sp-xxxl`: 48px

### Typography

See `typography.css` and `typography-ntg.css` for:

- Heading scales (h1-h6)
- Body text sizes (default, small)
- Link styles
- Font families

## 🚨 Important Notes

- **Do not** add `src/external-tokens/` to `.gitignore` - these files are committed
- External tokens provide defaults; local customizations override them
- When updating tokens, rebuild and test all components
- Token changes can have system-wide effects - review carefully
- Keep external tokens separate from local tokens for clear separation of concerns

## 📚 Related Documentation

- [Main README](../../README.md) - Project overview
- [src/tokens.css](../tokens.css) - Local token definitions and overrides
- [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md) - Deployment process

---

**Last Updated:** February 2026  
**Maintained by:** NT Government Design System Team

### Configuring GitHub Authentication for NPM

Create a `.npmrc` file in your home directory (`~/.npmrc`) with:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
@ntgovernment:registry=https://npm.pkg.github.com
```

Or use Git credential helper (already configured in this project):

```bash
# Set git to use credential manager for HTTPS
git config --global credential.helper manager

# NPM will use git credentials when installing from GitHub
npm install
```

## Updating Tokens

### From NPM Package

```bash
npm update @ntgovernment/web-design-system
```

### Manual Update

Re-copy files from the source repository when updates are available.

## Usage

These tokens are imported in `src/tokens.css`:

```css
/* External tokens (base) */
@import "./external-tokens/base-variables.css";
@import "./external-tokens/theme-ntg.css";
/* Add other theme files as needed */

/* Local token overrides */
:root {
  /* Project-specific customizations */
}
```

## Notes

- External tokens provide the CSS custom property foundation; local overrides in `src/tokens.css` take precedence via the cascade.
- These files are committed directly to this repo (manual sync approach). Do **not** add `src/external-tokens/` to `.gitignore`.

### Circular CSS-variable bug — workaround

The upstream token build pipeline occasionally generates self-referential CSS variables (e.g. `--type-mobile-body-default-size: var(--type-mobile-body-default-size);`). These cause infinite resolution loops at runtime.

**Current workaround:** explicit overrides have been added in `src/tokens.css` for the affected `--type-mobile-*` and `--type-link-*` variables so they resolve to concrete values.

This is a stop-gap only. The permanent fix is:

1. Correct the self-referential mappings in the external token source (`design-tokens/tokens.json`).
2. Regenerate the token CSS files and update this directory.
3. Remove the temporary overrides from `src/tokens.css`.
