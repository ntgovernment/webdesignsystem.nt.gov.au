#!/bin/bash

# ComponentViewer Preview Helper Script
# Copies preview files to Storybook's public directory for same-origin testing

echo "ðŸ“¦ Setting up ComponentViewer preview in Storybook..."

# Set the Storybook project directory
STORYBOOK_DIR="/c/Projects/web-design-system"
STORYBOOK_PUBLIC="$STORYBOOK_DIR/.storybook/public"

# Create public directory if it doesn't exist
if [ ! -d "$STORYBOOK_PUBLIC" ]; then
  echo "Creating .storybook/public directory..."
  mkdir -p "$STORYBOOK_PUBLIC"
fi

# Copy preview files to Storybook static directory
echo "Copying preview files to $STORYBOOK_PUBLIC..."
cp deploy/dxp-components/component-viewer/preview.html "$STORYBOOK_PUBLIC/component-viewer-preview.html"
cp deploy/dxp-components/component-viewer/main.js "$STORYBOOK_PUBLIC/component-viewer-main.js"
cp deploy/dxp-components/component-viewer/example.data.json "$STORYBOOK_PUBLIC/component-viewer-data.json"

# Update paths in the copied preview file for the new location
sed -i 's|import render from '\''\.\/main\.js'\'';|import render from '\''./component-viewer-main.js'\'';|g' "$STORYBOOK_PUBLIC/component-viewer-preview.html"
sed -i 's|fetch('\''\.\/example\.data\.json'\'')|fetch('\''./component-viewer-data.json'\'')|g' "$STORYBOOK_PUBLIC/component-viewer-preview.html"
sed -i 's|href="\.\.\/\.\.\/web-design-system\.css"|href="./web-design-system.css"|g' "$STORYBOOK_PUBLIC/component-viewer-preview.html"

# Copy design system CSS if it exists in deploy
if [ -f "deploy/web-design-system.css" ]; then
  cp deploy/web-design-system.css "$STORYBOOK_PUBLIC/"
  echo "âœ“ Copied web-design-system.css"
fi

echo ""
echo "âœ… Preview files copied to $STORYBOOK_PUBLIC"
echo ""
echo "ðŸš€ Next steps:"
echo ""
echo "   1. Navigate to your Storybook project:"
echo "      $ cd $STORYBOOK_DIR"
echo ""
echo "   2. Start Storybook dev server:"
echo "      $ npm run storybook"
echo ""
echo "   3. Open in browser:"
echo "      http://localhost:6006/component-viewer-preview.html"
echo "      (or whatever port your Storybook runs on)"
echo ""
echo "ðŸ’¡ Files will auto-reload when you make changes!"
echo ""

