#!/bin/bash

# TwoColumn Preview Helper Script
# Starts a local HTTP server to preview the TwoColumn component

echo "🚀 Starting TwoColumn preview server..."
echo ""
echo "This will start a local server in the current directory."
echo "Make sure you're in the deploy/dxp-components/two-column directory!"
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "preview.html" ]; then
    echo "⚠️  Warning: preview.html not found in current directory"
    echo "Make sure you're running this from: deploy/dxp-components/two-column/"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Starting server on http://localhost:3000..."
echo ""
echo "📖 Preview URL: http://localhost:3000/preview.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
dxp-next cmp dev-ui ./src/components
