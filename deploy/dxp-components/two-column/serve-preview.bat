@echo off
REM TwoColumn Preview Helper Script (Windows)
REM Starts a local HTTP server to preview the TwoColumn component

echo 🚀 Starting TwoColumn preview server...
echo.
echo This will start a local server in the current directory.
echo Make sure you're in the deploy\dxp-components\two-column directory!
echo.

REM Check if npx is available
where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: npx is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "preview.html" (
    echo ⚠️  Warning: preview.html not found in current directory
    echo Make sure you're running this from: deploy\dxp-components\two-column\
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

echo Starting server on http://localhost:3000...
echo.
echo 📖 Preview URL: http://localhost:3000/preview.html
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
npx serve -p 3000
