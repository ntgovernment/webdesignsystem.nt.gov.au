# Deployment Guide for Squiz Matrix

This guide explains how to deploy the NT Design System components to Squiz Matrix using Git File Bridge.

## Quick Reference

### Build Commands
```bash
# Install dependencies
npm install

# Start local development
npm run dev

# Build component viewer
npm run build

# Build individual components
npm run build:components

# Prepare for Squiz deployment
npm run deploy:squiz
```

## Deployment Structure

After running `npm run deploy:squiz`, files are organized as:

```
deploy/
├── assets/
│   ├── index-[hash].js      # Compiled JavaScript
│   └── index-[hash].css     # Compiled CSS
├── components/              # Individual component builds (future)
├── viewer/
│   ├── index.html          # Component viewer HTML
│   └── vite.svg            # Assets
└── manifest.json           # Deployment metadata
```

## Using in Squiz Matrix

### 1. Git File Bridge Setup

Configure your Git File Bridge in Squiz Matrix to sync the `deploy/` directory from this repository.

### 2. Reference Assets in Paint Layouts

In your Squiz Matrix paint layouts, reference the compiled files:

```html
<!-- Component Viewer Application -->
<link rel="stylesheet" href="%globals_asset_url:ASSET_ID%/assets/index-[hash].css">
<script type="module" src="%globals_asset_url:ASSET_ID%/assets/index-[hash].js"></script>

<!-- Container for the app -->
<div id="root"></div>
```

Replace `ASSET_ID` with your Squiz Matrix asset ID and `[hash]` with the actual hash from the build.

### 3. Component Usage

The component viewer provides an interactive way to browse and test all available components:

- **Two Column Component** - Responsive layout that stacks on mobile
- **Theme Switcher** - Light/dark theme toggle with persistence

## Development Workflow

1. Make changes to components in `src/components/`
2. Test locally with `npm run dev`
3. Run linter with `npm run lint`
4. Build with `npm run build`
5. Deploy with `npm run deploy:squiz`
6. Commit and push to trigger Git File Bridge sync

## Environment Variables

- `SQUIZ_DEPLOY_PATH` - Custom deployment directory (default: `./deploy`)

## Asset Hashing

The build process generates content-hashed filenames (e.g., `index-BItTTFhS.js`). 

To find the current hashes:
1. Check `deploy/manifest.json` after running deployment
2. Or check the `deploy/viewer/index.html` file which contains the correct references

## Best Practices

1. Always run `npm run deploy:squiz` before committing deployment files
2. Test the component viewer locally before deploying
3. Keep the `deploy/` directory in version control for Git File Bridge
4. Document any custom components added to the system
5. Update paint layout references when asset hashes change

## Troubleshooting

### Assets not loading
- Verify the Git File Bridge is syncing correctly
- Check that asset URLs match the deployed file names
- Ensure CORS settings allow loading from the asset server

### Components not rendering
- Check browser console for JavaScript errors
- Verify the `#root` div exists in your HTML
- Ensure both CSS and JS files are loaded

### Theme not persisting
- Check that localStorage is enabled in the browser
- Verify no conflicting theme scripts on the page
