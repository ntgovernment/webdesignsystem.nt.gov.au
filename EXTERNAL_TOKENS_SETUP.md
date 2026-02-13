# External Design Tokens - Setup Guide

## 📋 What Was Configured

This project has been set up to integrate CSS design tokens from the centralized NT Government Web Design System repository.

### Changes Made

1. **✅ Package Dependency Added**
   - Added `@ntgovernment/web-design-system` to [package.json](package.json)
   - Configured to install from: `git+https://github.com/ntgovernment/web-design-system.git`

2. **✅ External Tokens Directory Created**
   - Created [src/external-tokens/](src/external-tokens/) directory
   - Added [README.md](src/external-tokens/README.md) with full documentation

3. **✅ Token Import Structure Updated**
   - Modified [src/tokens.css](src/tokens.css) with external token import statements
   - Imports are currently commented out (will activate once files are available)
   - Added documentation explaining token hierarchy

4. **✅ Documentation Updated**
   - Updated [README.md](README.md) with Design Tokens Integration section
   - Added authentication and setup instructions
   - Documented token architecture and workflow

## 🎯 Next Steps Required

### Complete External Token Setup

Choose **ONE** of these options:

#### **Option A: NPM Package Installation (Recommended)**

This is the cleanest approach but requires resolving GitHub authentication:

```bash
# 1. Verify GitHub authentication
git config --get credential.helper
# Should show: manager (Windows) or osxkeychain (macOS)

# 2. Test repository access
git ls-remote https://github.com/ntgovernment/web-design-system.git

# 3. Install the package
npm install

# 4. Verify installation
ls node_modules/@ntgovernment/web-design-system/src/themes/

# 5. Update src/tokens.css imports to use node_modules path:
# Change: @import "./external-tokens/base-variables.css";
# To:     @import "@ntgovernment/web-design-system/src/themes/base-variables.css";
```

**If authentication fails**, you may need to:

- Use a GitHub Personal Access Token
- Configure SSH keys
- Contact your IT team for repository access

#### **Option B: Manual File Sync (Quick Start)**

Copy files directly from the external repository:

```bash
# 1. Clone the external design system (temporary)
cd ..
git clone https://github.com/ntgovernment/web-design-system.git temp-design-system

# 2. Copy theme CSS files
cd webdesignsystem.nt.gov.au
cp ../temp-design-system/src/themes/*.css ./src/external-tokens/

# 3. Verify files copied
ls src/external-tokens/*.css

# 4. Uncomment imports in src/tokens.css
# Remove the /* */ around the @import statements

# 5. Clean up
cd ..
rm -rf temp-design-system
```

#### **Option C: Git Submodule (Alternative)**

If you prefer git-native approach:

```bash
# 1. Remove npm dependency approach
#    Edit package.json and remove @ntgovernment/web-design-system line

# 2. Add as git submodule
git submodule add https://github.com/ntgovernment/web-design-system.git external/ntg-design-system
git submodule update --init --recursive

# 3. Update imports in src/tokens.css to:
# @import "../external/ntg-design-system/src/themes/base-variables.css";
# etc.

# 4. Commit submodule
git add .gitmodules external/
git commit -m "Add design system as git submodule"
```

### Activate Token Imports

Once files are available (via any option above):

1. **Edit [src/tokens.css](src/tokens.css)**
2. **Uncomment the import block** (lines ~22-30):

```css
/* Remove comment delimiters: */
@import "./external-tokens/base-variables.css";
@import "./external-tokens/common.css";
@import "./external-tokens/grid.css";
@import "./external-tokens/typography.css";
@import "./external-tokens/typography-literals.css";
@import "./external-tokens/typography-ntg.css";
@import "./external-tokens/theme-ntg.css";
```

3. **Adjust import paths if needed** based on which option you chose

### Test the Integration

After activating imports:

```bash
# 1. Test build
npm run build

# Check output
ls -lh deploy/web-design-system.min.css

# 2. Test development server
npm run dev

# Open browser to: http://localhost:5173/preview/

# 3. Inspect in browser DevTools
# - Check CSS variables are loaded
# - Verify no import errors in console
# - Test components render correctly
```

## 🔍 Verification Checklist

- [ ] External token files are accessible (via npm, manual copy, or submodule)
- [ ] Imports in src/tokens.css are uncommented
- [ ] Import paths match your chosen setup method
- [ ] `npm run build` completes without errors
- [ ] deploy/web-design-system.min.css contains external token variables
- [ ] `npm run dev` shows components with correct styling
- [ ] No CSS import errors in browser console

## 📚 Token Files Reference

The following CSS files from the external repository should be imported:

| File                      | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `base-variables.css`      | Core CSS custom properties (colors, spacing, etc.) |
| `common.css`              | Common design tokens shared across themes          |
| `grid.css`                | Grid system variables and responsive breakpoints   |
| `typography.css`          | Typography tokens (font sizes, line heights, etc.) |
| `typography-literals.css` | Literal typography values                          |
| `typography-ntg.css`      | NT Government specific typography                  |
| `theme-ntg.css`           | NT Government theme colors and branding            |

## 🎨 Token Override Pattern

The integration follows this cascade:

```
1. External Tokens (Foundation)
   ↓
2. Local Tokens (Project Overrides)
   ↓
3. Component Styles
```

**Example:**

```css
/* External token (from @ntgovernment/web-design-system) */
/* Defines: --clr-primary: #0066cc; */

/* Local override (in your src/tokens.css) */
:root {
  --clr-primary: #1f1f5f; /* Your custom value */
}

/* Component uses the override */
.header {
  background: var(--clr-primary); /* Uses #1f1f5f */
}
```

## 🔄 Keeping Tokens Updated

### NPM Package Method

```bash
# Update to latest version
npm update @ntgovernment/web-design-system

# Or reinstall
npm install @ntgovernment/web-design-system@latest

# Rebuild
npm run build
```

### Manual Sync Method

```bash
# Re-copy files from external repo
# (Use same process as initial setup)
```

### Git Submodule Method

```bash
# Update submodule to latest
git submodule update --remote external/ntg-design-system
git add external/ntg-design-system
git commit -m "Update design system tokens"
```

## 🐛 Troubleshooting

### NPM Install Fails with Authentication Error

**Problem**: `npm error A git connection error occurred`

**Solutions**:

1. Check GitHub authentication: `git config --get credential.helper`
2. Test repo access: `git ls-remote https://github.com/ntgovernment/web-design-system.git`
3. Try HTTPS instead of SSH (already configured in package.json)
4. Create GitHub Personal Access Token and use in URL
5. Use Option B (manual sync) as temporary workaround

### Build Fails with Import Errors

**Problem**: `Error: Failed to resolve import`

**Solutions**:

1. Verify files exist in src/external-tokens/ or node_modules/
2. Check import paths match your setup method
3. Ensure imports are uncommented in src/tokens.css
4. Try absolute paths or alias resolution

### CSS Variables Missing in Browser

**Problem**: Components don't have correct styling

**Solutions**:

1. Check browser DevTools > Elements > Computed styles
2. Look for CSS custom properties (--var-name)
3. Verify deploy/web-design-system.min.css contains tokens
4. Check for CSS import order issues
5. Ensure build process completed successfully

### File Path Issues on Windows

**Problem**: Import paths with backslashes fail

**Solutions**:

1. Always use forward slashes in CSS imports
2. Example: `@import "./external-tokens/file.css"` ✅
3. Not: `@import ".\external-tokens\file.css"` ❌

## 📞 Support

For issues with:

- **External repository access**: Contact NT Government Design System team
- **Build process**: Check [README.md](README.md) and build scripts
- **Token integration**: Review [src/external-tokens/README.md](src/external-tokens/README.md)

## 🎉 Quick Start Summary

**Fastest path to get running:**

```bash
# 1. Choose manual sync for immediate setup
git clone https://github.com/ntgovernment/web-design-system.git ../temp-ds
cp ../temp-ds/src/themes/*.css ./src/external-tokens/
rm -rf ../temp-ds

# 2. Uncomment imports in src/tokens.css (lines ~22-30)

# 3. Test build
npm run build

# 4. Test dev server
npm run dev
```

Then later migrate to npm package or git submodule for easier updates.

---

**Status**: ✅ Setup Complete - Awaiting token files and import activation
