@echo off
echo Starting Gallery Restoration CMS for Windows...
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies...
call npm install

echo.
echo Starting development server...
echo.
echo Windows compatibility mode enabled
echo Server will bind to localhost instead of 0.0.0.0
echo.
echo After server starts, open: http://localhost:5000
echo Login as admin: admin@example.com / admin123
echo.

set NODE_ENV=development
npx cross-env NODE_ENV=development tsx server/index.ts