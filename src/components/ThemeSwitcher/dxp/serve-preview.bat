@echo off
REM Serve the preview.html file for local development testing
REM Run this script from the theme-switcher directory

echo.
echo ========================================
echo Theme Switcher Component - Local Preview
echo ========================================
echo.
echo Starting local preview server...
echo.
echo Preview will be available at:
echo   http://localhost:3000/dxp-components/theme-switcher/preview.html
echo.
echo Press Ctrl+C to stop the server
echo.

REM Change to deploy directory and serve
cd ..\..
python -m http.server 3000
