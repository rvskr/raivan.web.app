# PowerShell script for Windows
Write-Host "Starting Gallery Restoration CMS for Windows..." -ForegroundColor Green
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Windows compatibility mode enabled" -ForegroundColor Yellow
Write-Host "Server will bind to localhost instead of 0.0.0.0" -ForegroundColor Yellow
Write-Host ""
Write-Host "After server starts, open: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Login as admin: admin@example.com / admin123" -ForegroundColor Cyan
Write-Host ""

$env:NODE_ENV = "development"
npx cross-env NODE_ENV=development tsx server/index.ts