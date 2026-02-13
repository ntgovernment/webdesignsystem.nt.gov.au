@echo off
REM ComponentViewer Preview Helper Script (Windows)
REM Copies preview files to Storybook's public directory for same-origin testing

echo 📦 Setting up ComponentViewer preview in Storybook...
echo.

REM Set the Storybook project directory
set STORYBOOK_DIR=C:\Projects\web-design-system
set STORYBOOK_PUBLIC=%STORYBOOK_DIR%\.storybook\public

REM Create public directory if it doesn't exist
if not exist "%STORYBOOK_PUBLIC%\" (
  echo Creating .storybook\public directory...
  mkdir "%STORYBOOK_PUBLIC%"
)

REM Copy and modify preview.html
echo Copying preview files to %STORYBOOK_PUBLIC%...
powershell -Command "(gc deploy\dxp-components\component-viewer\preview.html) -replace 'import render from ''\.\/main\.js'';', 'import render from ''./component-viewer-main.js'';' -replace 'fetch\(''\.\/example\.data\.json''\)', 'fetch(''./component-viewer-data.json'')' -replace 'href=\"\.\.\/\.\.\/ntg-design-system\.css\"', 'href=\"./ntg-design-system.css\"' | Out-File -encoding ASCII %STORYBOOK_PUBLIC%\component-viewer-preview.html"

REM Copy other files
copy deploy\dxp-components\component-viewer\main.js "%STORYBOOK_PUBLIC%\component-viewer-main.js" >nul
copy deploy\dxp-components\component-viewer\example.data.json "%STORYBOOK_PUBLIC%\component-viewer-data.json" >nul

REM Copy design system CSS if it exists
if exist "deploy\ntg-design-system.css" (
  copy deploy\ntg-design-system.css "%STORYBOOK_PUBLIC%\" >nul
  echo ✓ Copied ntg-design-system.css
)

echo.
echo ✅ Preview files copied to storybook-static\
echo.
echo 🚀 Start with one of these methods:
echo.%STORYBOOK_PUBLIC%
echo.
echo 🚀 Next steps:
echo.
echo    1. Navigate to your Storybook project:
echo       ^> cd %STORYBOOK_DIR%
echo.
echo    2. Start Storybook dev server:
echo       ^> npm run storybook
echo.
echo    3. Open in browser:
echo       http://localhost:6006/component-viewer-preview.html
echo       (or whatever port your Storybook runs on)
echo.
echo 💡 Files will auto-reload when you make changes!
echo.