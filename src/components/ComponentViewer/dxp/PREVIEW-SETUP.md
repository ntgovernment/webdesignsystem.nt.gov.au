# ComponentViewer - Local Preview Setup

This guide explains how to preview the ComponentViewer component with your Storybook instance running in a separate directory.

## Quick Start

Run the setup script to copy preview files to your Storybook project:

### Windows

```bash
.\deploy\dxp-components\component-viewer\serve-preview.bat
```

### Linux/Mac

```bash
bash deploy/dxp-components/component-viewer/serve-preview.sh
```

This will:

1. Create `.storybook/public/` directory if it doesn't exist
2. Copy preview files to `C:\Projects\web-design-system\.storybook\public\`
3. Update file paths for the new location

## Manual Setup

If you prefer to set up manually:

### Step 1: Copy Files

```bash
# Navigate to your Storybook project
cd C:\Projects\web-design-system

# Create public directory
mkdir .storybook\public

# Copy files from design system project
copy ..\webdesignsystem.nt.gov.au\deploy\dxp-components\component-viewer\preview.html .storybook\public\component-viewer-preview.html
copy ..\webdesignsystem.nt.gov.au\deploy\dxp-components\component-viewer\main.js .storybook\public\component-viewer-main.js
copy ..\webdesignsystem.nt.gov.au\deploy\dxp-components\component-viewer\example.data.json .storybook\public\component-viewer-data.json
copy ..\webdesignsystem.nt.gov.au\deploy\ntg-design-system.css .storybook\public\
```

### Step 2: Update Paths in preview.html

Edit `.storybook\public\component-viewer-preview.html`:

```javascript
// Change:
import render from './main.js';
// To:
import render from './component-viewer-main.js';

// Change:
const response = await fetch('./example.data.json');
// To:
const response = await fetch('./component-viewer-data.json');

// Change:
<link rel="stylesheet" href="../../ntg-design-system.css">
// To:
<link rel="stylesheet" href="./ntg-design-system.css">
```

### Step 3: Start Storybook

```bash
# In your Storybook project directory
cd C:\Projects\web-design-system
npm run storybook
```

### Step 4: Open Preview

Navigate to: http://localhost:6006/component-viewer-preview.html

(Replace `6006` with your Storybook port if different)

## Why This Approach?

### Same-Origin Policy

By serving the ComponentViewer preview from the same server as Storybook:

- ✅ **No CORS errors** - Both on same origin
- ✅ **Code extraction works** - Can access iframe content
- ✅ **Live preview** - See actual Storybook components
- ✅ **Auto-reload** - Changes to preview files reload automatically

### Alternative: Proxy Setup (Not Recommended)

You could use Vite's proxy feature, but it's more complex and doesn't support iframe content access across origins.

## Troubleshooting

### Preview shows but iframes are empty

- Check that Storybook is running
- Verify story IDs in `example.data.json` match your actual stories
- Check browser console for errors

### CORS errors still appearing

- Ensure you're accessing via Storybook's URL (e.g., `localhost:6006`)
- Not via `file://` or a different port
- Both preview and iframe must be on same domain/port

### Files not copying

- Check that paths in scripts match your directory structure
- Verify `.storybook/public/` directory exists
- Check file permissions

### Changes not reflecting

- Storybook's public folder has hot reload
- Hard refresh browser (Ctrl+Shift+R) if needed
- Check that you're editing the right copy of the files

## Development Workflow

1. **Make changes** to ComponentViewer files in this project
2. **Run setup script** to copy to Storybook
3. **Refresh browser** to see changes
4. **Repeat** as needed

For rapid iteration, consider:

- Setting up a file watcher
- Creating npm scripts
- Using symlinks (advanced)

## Production Deployment

This setup is for **development only**. For production:

- Use the Squiz DXP Component Service pattern
- Or deploy as static files via Git File Bridge
- See main README.md for deployment instructions
