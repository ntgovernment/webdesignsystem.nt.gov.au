#!/bin/bash
# Serve the preview.html file for local development testing
# Run this script from the theme-switcher directory

echo "🚀 Starting local preview server for Theme Switcher component..."
echo "📂 Serving from: $(pwd)"
echo ""
echo "Preview will be available at:"
echo "  http://localhost:3000/preview.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Use Python's built-in HTTP server (available on most systems)
# Serve from the parent directory so relative paths work
cd ../..
python3 -m http.server 3000
