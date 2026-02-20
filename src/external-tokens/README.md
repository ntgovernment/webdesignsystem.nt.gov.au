# External Design System Tokens

This directory contains CSS design tokens from the NT Government Web Design System repository.

## Source Repository

- **Repository**: https://github.com/ntgovernment/web-design-system
- **Source Path**: `src/themes/`
- **Package**: `@ntgovernment/web-design-system`

## Files to Sync

The following CSS files should be copied from the external repository:

1. **base-variables.css** - Core CSS custom properties
2. **common.css** - Common design tokens
3. **grid.css** - Grid system variables
4. **typography.css** - Typography tokens
5. **typography-literals.css** - Literal typography values
6. **typography-ntg.css** - NT Government specific typography
7. **theme-ntg.css** - NT Government theme

## Manual Setup (Temporary)

Until npm package installation is configured, manually copy files:

```bash
# Clone the external repo (if not already cloned)
git clone https://github.com/ntgovernment/web-design-system.git ../temp-design-system

# Copy theme files
cp ../temp-design-system/src/themes/*.css ./src/external-tokens/

# Clean up
rm -rf ../temp-design-system
```

## Automated Setup (Preferred)

Once GitHub authentication is configured for npm:

```bash
# Install package from GitHub
npm install

# Files will be available at:
# node_modules/@ntgovernment/web-design-system/src/themes/
```

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
